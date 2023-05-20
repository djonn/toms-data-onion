# Tom's Data Onion

> ⚠ **Warning:** Running the solution require nodejs 20.0.0 or above.

https://www.tomdalling.com/toms-data-onion/

Tom's Data Onion is a series of layers of obfuscated data along with instructions on how do deobfuscate it.

As Tom puts it:

> There are many puzzles wrapped inside each other, like a matryoshka doll, or the layers of an onion.

I have had this website bookmarked for years and no longer know where I originally found it, but have wanted to solve it for a long time. I believe I started solving it a couple of years ago, but got stuck on layer 3 and gave up.

For a while now I've primarily been working in JavaScript (yes, not even TypeScript) so I decided to stick with that. I tried keeping the layers separate but using the same format and having `main.js` being mostly just scaffolding.

For each layer I save the full layer along with just the payload to make it easier for me to see if my solution was correct and the ASCII85 encoded string has the correct start and end delimiters.

**Beware, possible spoilers ahead!**

## Layer 0 - ASCII85

I decided to implement the ASCII85 decoder myself using the description and examples I was able to find on [Wikipedia](https://en.wikipedia.org/wiki/Ascii85#Adobe_version). Doing this turned layer 0 into something much harder than layers 1 and to.

A thing I noticed is that the Wikipedia article does not mention the `<~` delimiter used to mark the start of the ASCII85 encoded string.

## Layer 1 - Bitwise Operations

Pretty easy. Shift the bytes while replacing the most significant bit with the least significant bit from the original byte.

I didn't check the hints until after I had gotten this working and was delighted to find that they pencilled out exactly what I had done myself.

## Layer 2 - Parity Bit

Nothing much to say here, still pretty simple. I feel like I'm kind of cheating a bit by converting numbers to strings containing the binary representation, but I don't want to try and do it in another way.

In between solving layers 2 and 3 I refactored my ASCII85 decoder from returning a string to an array of numbers, which I think made working with it a lot cleaner.

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

_At one point during implementing I actually did notice that I had gotten most of the title of the next layer as some like `==[ Layer 4/6: Network Traffi*2,` from which I deduced that the first 32 bytes of the payload was `==[ Layer 4/6: Network Traffic ]`, however I wanted to find the secret key programmatically without me guessing some it._

## Layer4 - Network Traffic

Networks like Tom's Data Onion are made up of layers, in this case some data wrapped in a UDP layer which then is wrapped in a IPv4 layer.

The instructions mention the officials specifications for the IPv4 and UDP protocols, but those are hard to understand, so I instead go straight to wikipedia where I find this image showing the structure of an IPv4 packet.

![Structure of a IPv4 packet](https://upload.wikimedia.org/wikipedia/commons/6/60/IPv4_Packet-en.svg)

From this I recognize that I will need to extract 4 pieces of information: "Total length", "Header checksum", "Source address" and "Destination address". Luckily none of these fractions of bytes, so extraction is easy enough.
Calculating the IPv4 checksum was a bit confusing to me because of JavaScript's use of 32-bit SIGNED integers in bitwise operations, so had to lookup[^1] what I was missing and turns out I needed to mask the one's complement to only keep the 16 LSB's.

![Structure of a UDP packet](https://4.bp.blogspot.com/-eZlYBliVoQY/VcArZ3x0g4I/AAAAAAAABSc/IVe74IKg5Aw/s1600/UDP%2BHeader.JPG)

Next up is the UDP header which only contains 4 fields, "Source port", "Destination port", "Length" and "Checksum", of which I need everything but the source port.

I got caught on the checksum calculation initially because it seemed from both the specification and Wikipedia that the checksum was needed to calculate the checksum turning it into some kind of grandfather paradox. I quickly though found a UDP checksum calculation example[^2] that helped me figure it out. Shortly after I got confused about the wording of how to calculate the checksum used in the specification and instead went back to the example I found and used the method for calculating it found there.

[^1]: [IPv4 Checksum implementation by bryc](https://gist.github.com/bryc/8a0885a4be58b6bbf0ec54c7758c0841#file-ipv4-js-L50-L59)
[^2]: [UDP checksum calculation example by securitynik](https://www.securitynik.com/2015/08/calculating-udp-checksum-with-taste-of.html)
