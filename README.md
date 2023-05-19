# Tom's Data Onion

https://www.tomdalling.com/toms-data-onion/

## Layer 0 - ASCII85

https://en.wikipedia.org/wiki/Ascii85#Adobe_version

## Layer 1 - Bitwise Operations

## Layer 2 - Parity Bit

## Layer 3 - XOR Encryption

This layer has a secret key that we will need to crack.
I can see that each of the layers has started with a message like:

```
==[ Layer 3/6: XOR Encryption ]=============================

Lorem Ipsum
```

I'm assuming the next layer will also start similar to this.
Knowing some decoded characters along with their position in the rotating secret key we can start to fill out the positions in the key by xor'ing the encrypted message with the guessed parts of the message.

I'm guessing that the first 15 bytes of the payload is going to be `==[ Layer 4/6: ` and skipping ahead to the next part of the message with an unknown byte in the key I can see that they are mostly "=" along with 2 new-lines.

I know have 30/32 bytes in the secret key and from here I'm just going to guess; So I take 2 random bytes as the remainder of the key and decode the whole payload and then look for the payload marker which I know is going to be somewhere in the message. Since the payload marker is longer than the key we can be sure that we do indeed have the correct key.
Cracking the last 2 bytes of the secret key took just a couple of minutes on my ~4 year old laptop.

_At one point during implementing I actually did notice that I had gotten most of the title of the next layer as "" from which I deduced that the first 32 bytes of the payload was `==[ Layer 4/6: Network Traffic ]`, however I wanted to find the secret key programatically without me guessing some it._
