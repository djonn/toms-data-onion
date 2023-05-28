export class TomtelCoreI69 {
  running = true;
  output = [];
  memory = null;

  register = {
    // 8-bit registers
    a: 0, // accumulator
    b: 0, // operand
    c: 0, // count/offset
    d: 0, // general purpose
    e: 0, // general purpose
    f: 0, // flags
    // 32-bit registers
    la: 0, // general purpose
    lb: 0, // general purpose
    lc: 0, // general purpose
    ld: 0, // general purpose
    ptr: 0, // pointer
    pc: 0, // program counter
    // 8-bit pseudo-register
    // "(ptr+c)": 0, // memory cursor
  };

  threeBitTo8BitRegister = [null, "a", "b", "c", "d", "e", "f", "(ptr+c)"];
  threeBitTo32BitRegister = [null, "la", "lb", "lc", "ld", "ptr", "pc"];

  instructions = {
    /*
    --[ ADD a <- b ]--------------------------------------------

    8-bit addition
    Opcode: 0xC2 (1 byte)

    Sets `a` to the sum of `a` and `b`, modulo 256.
    */
    ADD: {
      opcode: 0xc2,
      size: 1,
      execute: ([_]) => {
        this.register["a"] = (this.register["a"] + this.register["b"]) % 256;
      },
    },

    /*
    --[ APTR imm8 ]---------------------------------------------

    Advance ptr
    Opcode: 0xE1 0x__ (2 bytes)

    Sets `ptr` to the sum of `ptr` and `imm8`. Overflow
    behaviour is undefined.
    */
    APTR: {
      opcode: 0xe1,
      size: 2,
      execute: ([_, imm1]) => {
        this.register["ptr"] = this.register["ptr"] + imm1;
      },
    },

    /*
    --[ CMP ]---------------------------------------------------

      Compare
      Opcode: 0xC1 (1 byte)

      Sets `f` to zero if `a` and `b` are equal, otherwise sets
      `f` to 0x01.
    */
    CMP: {
      opcode: 0xc1,
      size: 1,
      execute: ([_]) => {
        this.register["f"] = this.register["a"] === this.register["b"] ? 0 : 1;
      },
    },

    /*
    --[ HALT ]--------------------------------------------------

    Halt execution
    Opcode: 0x01 (1 byte)

    Stops the execution of the virtual machine. Indicates that
    the program has finished successfully.
    */
    HALT: {
      opcode: 0x01,
      size: 1,
      execute: ([_]) => {
        this.running = false;
      },
    },

    /*
    --[ JEZ imm32 ]---------------------------------------------

      Jump if equals zero
      Opcode: 0x21 0x__ 0x__ 0x__ 0x__ (5 bytes)

      If `f` is equal to zero, sets `pc` to `imm32`. Otherwise
      does nothing.
    */
    JEZ: {
      opcode: 0x21,
      size: 5,
      execute: ([_, imm1, imm2, imm3, imm4]) => {
        const imm32 = this.to32BitLe([imm1, imm2, imm3, imm4]);
        if (this.register["f"] === 0) {
          this.register["pc"] = imm32;
        }
      },
    },

    /*
    --[ JNZ imm32 ]---------------------------------------------

      Jump if not zero
      Opcode: 0x22 0x__ 0x__ 0x__ 0x__ (5 bytes)

      If `f` is not equal to zero, sets `pc` to `imm32`.
      Otherwise does nothing.
    */
    JNZ: {
      opcode: 0x22,
      size: 5,
      execute: ([_, imm1, imm2, imm3, imm4]) => {
        const imm32 = this.to32BitLe([imm1, imm2, imm3, imm4]);
        if (this.register["f"] !== 0) {
          this.register["pc"] = imm32;
        }
      },
    },

    /*
    --[ MV {dest} <- {src} ]------------------------------------

      Move 8-bit value
      Opcode: 0b01DDDSSS (1 byte)

      Sets `{dest}` to the value of `{src}`.

      Both `{dest}` and `{src}` are 3-bit unsigned integers that
      correspond to an 8-bit register or pseudo-register. In the
      opcode format above, the "DDD" bits are `{dest}`, and the
      "SSS" bits are `{src}`. Below are the possible valid
      values (in decimal) and their meaning.

                              1 => `a`
                              2 => `b`
                              3 => `c`
                              4 => `d`
                              5 => `e`
                              6 => `f`
                              7 => `(ptr+c)`

      A zero `{src}` indicates an MVI instruction, not MV.
    */
    MV: {
      opcode: null, // special rule
      size: 1,
      execute: ([opcode]) => {
        const dest = (opcode & 0b00111000) >> 3;
        const destinationName = this.threeBitTo8BitRegister[dest];
        const src = opcode & 0b00000111;
        const sourceName = this.threeBitTo8BitRegister[src];

        if (destinationName === "(ptr+c)") {
          const cursor = this.register["ptr"] + this.register["c"];
          this.memory[cursor] = this.register[sourceName];
        } else if (sourceName === "(ptr+c)") {
          const cursor = this.register["ptr"] + this.register["c"];
          this.register[destinationName] = this.memory[cursor];
        } else {
          this.register[destinationName] = this.register[sourceName];
        }
      },
    },

    /*
    --[ MV32 {dest} <- {src} ]----------------------------------

      Move 32-bit value
      Opcode: 0b10DDDSSS (1 byte)

      Sets `{dest}` to the value of `{src}`.

      Both `{dest}` and `{src}` are 3-bit unsigned integers that
      correspond to a 32-bit register. In the opcode format
      above, the "DDD" bits are `{dest}`, and the "SSS" bits are
      `{src}`. Below are the possible valid values (in decimal)
      and their meaning.

                              1 => `la`
                              2 => `lb`
                              3 => `lc`
                              4 => `ld`
                              5 => `ptr`
                              6 => `pc`
    */
    MV32: {
      opcode: null, // special rule
      size: 1,
      execute: ([opcode]) => {
        const dest = (opcode & 0b00111000) >> 3;
        const destinationName = this.threeBitTo32BitRegister[dest];
        const src = opcode & 0b00000111;
        const sourceName = this.threeBitTo32BitRegister[src];
        this.register[destinationName] = this.register[sourceName];
      },
    },

    /*
    --[ MVI {dest} <- imm8 ]------------------------------------

      Move immediate 8-bit value
      Opcode: 0b01DDD000 0x__ (2 bytes)

      Sets `{dest}` to the value of `imm8`.

      `{dest}` is a 3-bit unsigned integer that corresponds to
      an 8-bit register or pseudo-register. It is the "DDD" bits
      in the opcode format above. Below are the possible valid
      values (in decimal) and their meaning.

                              1 => `a`
                              2 => `b`
                              3 => `c`
                              4 => `d`
                              5 => `e`
                              6 => `f`
                              7 => `(ptr+c)`
    */
    MVI: {
      opcode: null, // special rule
      size: 2,
      execute: ([opcode, imm1]) => {
        const dest = (opcode & 0b00111000) >> 3;
        const destinationName = this.threeBitTo8BitRegister[dest];

        if (destinationName === "(ptr+c)") {
          const cursor = this.register["ptr"] + this.register["c"];
          this.memory[cursor] = imm1;
        } else {
          this.register[destinationName] = imm1;
        }
      },
    },

    /*
    --[ MVI32 {dest} <- imm32 ]---------------------------------

      Move immediate 32-bit value
      Opcode: 0b10DDD000 0x__ 0x__ 0x__ 0x__ (5 bytes)

      Sets `{dest}` to the value of `imm32`.

      `{dest}` is a 3-bit unsigned integer that corresponds to a
      32-bit register. It is the "DDD" bits in the opcode format
      above. Below are the possible valid values (in decimal)
      and their meaning.

                              1 => `la`
                              2 => `lb`
                              3 => `lc`
                              4 => `ld`
                              5 => `ptr`
                              6 => `pc`
    */
    MVI32: {
      opcode: null, // special rule
      size: 5,
      execute: ([opcode, imm1, imm2, imm3, imm4]) => {
        const dest = (opcode & 0b00111000) >> 3;
        const destinationName = this.threeBitTo32BitRegister[dest];
        const imm32 = this.to32BitLe([imm1, imm2, imm3, imm4]);
        this.register[destinationName] = imm32;
      },
    },

    /*
    --[ OUT a ]-------------------------------------------------

      Output byte
      Opcode: 0x02 (1 byte)

      Appends the value of `a` to the output stream.
    */
    OUT: {
      opcode: 0x02,
      size: 1,
      execute: ([_]) => {
        this.output.push(this.register["a"]);
      },
    },

    /*
    --[ SUB a <- b ]--------------------------------------------

      8-bit subtraction
      Opcode: 0xC3 (1 byte)

      Sets `a` to the result of subtracting `b` from `a`. If
      subtraction would result in a negative number, 256 is
      added to ensure that the result is non-negative.
    */
    SUB: {
      opcode: 0xc3,
      size: 1,
      execute: ([_]) => {
        this.register["a"] =
          (this.register["a"] - this.register["b"] + 256) % 256;
      },
    },

    /*
    --[ XOR a <- b ]--------------------------------------------

      8-bit bitwise exclusive OR
      Opcode: 0xC4 (1 byte)

      Sets `a` to the bitwise exclusive OR of `a` and `b`.
    */
    XOR: {
      opcode: 0xc4,
      size: 1,
      execute: ([_]) => {
        this.register["a"] = this.register["a"] ^ this.register["b"];
      },
    },
  };

  constructor(program) {
    this.memory = [...program];
  }

  to32BitLe(bytes) {
    return bytes
      .map((byte, i) => byte << (i * 8))
      .reduce((acc, cur) => acc | cur, 0);
  }

  getInstruction(opcode) {
    if ((opcode & 0b11000111) === 0b01000000) {
      return this.instructions.MVI;
    }
    if ((opcode & 0b11000000) === 0b01000000) {
      return this.instructions.MV;
    }

    if ((opcode & 0b11000111) === 0b10000000) {
      return this.instructions.MVI32;
    }

    if ((opcode & 0b11000000) === 0b10000000) {
      return this.instructions.MV32;
    }

    return Object.values(this.instructions).find(
      (ins) => ins.opcode === opcode
    );
  }

  run() {
    while (this.running) {
      const opcode = this.memory[this.register["pc"]];
      const instruction = this.getInstruction(opcode);
      const immediates = this.memory.slice(
        this.register["pc"],
        this.register["pc"] + instruction.size
      );

      this.register["pc"] += instruction.size;

      instruction.execute(immediates);
    }

    return this.output;
  }
}
