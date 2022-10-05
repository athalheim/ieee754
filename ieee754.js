/* IEEE Standard 754 Floating Point Numbers 
  using javascript
  ----------------
  Default parameters:
    bitCount:   Integer: 8,16,32,64 bits, Float: 32,64 bits;
    isInteger:  true/false;
    isSigned:   true/false, valid only when 'isInteger' is true;
    endianMode: first byte is 'little-endian' or 'big-endian';

  Procedures:
    setBytes: Convert numeric value to byte array
      Parameters:
        value:      (required) valid numeric value (big, int or float);
        bitCount:   (optional) Integer: 8,16,32,64 bits, Float: 32,64 bits;
        isInteger:  (optional) true/false;
        isSigned:   (optional) true/false, valid only when 'isInteger' is true;
        endianMode: (optional) first byte is 'little-endian' or 'big-endian';
      Returns: byte array

    setValue: Convert byte array to numeric value
      Parameters:
        bytes:      (required) byte array;
        bitCount:   (optional) Integer: 8,16,32,64 bits, Float: 32,64 bits;
        isInteger:  (optional) true/false;
        isSigned:   (optional) true/false, valid only when 'isInteger' is true;
        endianMode: (optional) first byte is 'little-endian' or 'big-endian';
      Returns: numeric value

  Functions:
    endianness:         Checks system endianness:
                          -returns 'little' or 'big';
                          -used to compare with provided parameter.
    setEndianParameter: Sets procedure's internal 'localEndianMode' according to provided or system value.
    setParameter:       Sets other parameters according to provided or default value.
*/

ieee754 = {
    // Global parameters:
    bitCount:         32,
    isInteger:        false,
    isSigned:         true,   // 'isSigned' is used with integer mode only
    // System byte order:
    //  'littleEndian' means the LEAST significant byte comes FIRST!
    // Constants:
    littleEndianMode: 'little endian',
    bigEndianMode:    'big endian',

    // Check system endianness: used to synchronize client data with system usage
    endianness: function() {
      let uInt32      = new Uint32Array([0x11223344]);
      let uInt8       = new Uint8Array(uInt32.buffer);
      if(uInt8[0] === 0x44) {
        return ieee754.littleEndianMode;
      } else if (uInt8[0] === 0x11) {
        return ieee754.bigEndianMode;
      } else {
        throw new Error("Something crazy just happened");
        alert("Something crazy just happened");
      }
    },

    setEndianParameter: function(isLittleEndian) {
      if ((isLittleEndian === undefined) || (isLittleEndian === null)) {
        return ieee754.endianness();
      } else if (isLittleEndian === true) {
        return ieee754.littleEndianMode;
      } else {
        return ieee754.bigEndianMode;
      }
    },

    setParameter: function(newValue, defaultValue) {
      if ((newValue === undefined) || (newValue === null)) {
        return defaultValue;
      } else {
        return newValue;
      }
    },

    checkParameters: function(value, bitCount, isInteger, isSigned) {
      if (![8, 16, 32, 64].includes(bitCount)) {
        throw new Error("Invalid bit count: requires 8,16, 32 or 64!");
      } else if (isInteger) {
        if (!isSigned && (value < 0)) {
          throw new Error("Unsigned mode requires positive value!");
        } else if (bitCount === 64) {
          if (typeof value !== 'bigint') {
            throw new Error("Bit count requires bigInt value!");
          }
        } else {
          if (!Number.isInteger(value)) {
            throw new Error("Integer mode requires integer value!");
          }
        }
      } else if (![32, 64].includes(bitCount)) {
        throw new Error("Bit count does not match float mode!");
      }
      return true;
    },

    // Set Bytes
    //  Optional parameters: bitCount, isLittleEndian, isInteger, isSigned
    setBytes:    function(value, bitCount, isLittleEndian, isInteger, isSigned) {
      // Set inner parameters
      bitCount        = ieee754.setParameter(bitCount,  ieee754.bitCount);
      localEndianMode = ieee754.setEndianParameter(isLittleEndian);
      isInteger       = ieee754.setParameter(isInteger, ieee754.isInteger);
      isSigned        = ieee754.setParameter(isSigned,  ieee754.isSigned);

      // TODO
      if (!ieee754.checkParameters(value, bitCount, isInteger, isSigned)) {
        return null;
      }

      // Initialize return value
      bytes           = null;
      // Set bytes according to parameters
      if (isInteger) {
        if (isSigned) {
          if ((bitCount === 64) && (typeof value === 'bigint')) {
            bytes     = new Uint8Array(new BigUint64Array([value]).buffer);
          } else if (Number.isInteger(value)) {
            if (bitCount === 32) {
              bytes   = new Uint8Array(new Uint32Array([value]).buffer);
            } else if (bitCount === 16) {
              bytes   = new Uint8Array(new Uint16Array([value]).buffer);
            } else if (bitCount === 8) {
              bytes   = new Uint8Array(new Uint8Array([value]).buffer);
            }
          }
        } else {
          if ((bitCount === 64) && (typeof value === 'bigint')) {
            bytes     = new Uint8Array(new BigInt64Array([value]).buffer);
          } else if (Number.isInteger(value)) {
            if (bitCount === 32) {
              bytes   = new Uint8Array(new Int32Array([value]).buffer);
            } else if (bitCount === 16) {
              bytes   = new Uint8Array(new Int16Array([value]).buffer);
            } else if (bitCount === 8) {
              bytes   = new Uint8Array(new Int8Array([value]).buffer);
            }
          }
        }
      } else if (!isNaN(value)) {
        if (bitCount === 32) {
          bytes       = new Uint8Array(new Float32Array([value]).buffer);
        } else if (bitCount === 64) {
          bytes       = new Uint8Array(new Float64Array([value]).buffer);
        }
      }
      
      // Reverse byte array when local endianness parameter does not match system endianness
        if (bytes !== null) {
        if (localEndianMode !== ieee754.endianness()) {
          bytes.reverse()
        }
      }
      return bytes;
    },

    // Single byte array parameter:
    //  Optional parameters: bitCount, isLittleEndian, isInteger, isSigned
    setValue(bytes, bitCount, isLittleEndian, isInteger, isSigned) {
      // Set inner parameters
      bitCount        = ieee754.setParameter(bitCount,  ieee754.bitCount);
      localEndianMode = ieee754.setEndianParameter(isLittleEndian);
      isInteger       = ieee754.setParameter(isInteger, ieee754.isInteger);
      isSigned        = ieee754.setParameter(isSigned,  ieee754.isSigned);

      // Reverse byte array when local endianness parameter does not match system endianness
      if (localEndianMode !== ieee754.endianness()) {
        bytes.reverse()
      }

      // Declare and fill buffer with provided bytes
      const buffer    = new ArrayBuffer(bytes.length);
      const byteArray = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i++) {
        byteArray[i]  = bytes[i];
      }
      // Set numeric value according to parameters
       if (isInteger) {
        if (isSigned) {
          if (bitCount === 64) {
            return new BigInt64Array(buffer)[0];
          } else if (bitCount === 32) {
            return new Int32Array(buffer)[0];
          } else if (bitCount === 16) {
            return new Int16Array(buffer)[0];
          } else if (bitCount === 8) {
            return new Int8Array(buffer)[0];
          }
        } else {
          if (bitCount === 64) {
            return new BigUint64Array(buffer)[0];
          } else if (bitCount === 32) {
            return new Uint32Array(buffer)[0];
          } else if (bitCount === 16) {
            return new Uint16Array(buffer)[0];
          } else if (bitCount === 8) {
            return new Uint8Array(buffer)[0];
          }
        }
      } else {
        if (bitCount === 32) {
          return new Float32Array(buffer)[0];
        } else if (bitCount === 64) {
          return new Float64Array(buffer)[0];
        }
      }
      return null;
    },
}

/* -\\- */
