// According to IEET specification 754
// -Convert float to byte array
// -Convert byte array to float

var ieee754= {
        // Definitions: exponent, fraction and bias
    bitFormats:{
        bits16:  [ 5,  10,   15],
        bits32:  [ 8,  23,  127],
        bits64:  [11,  52, 1023],
        bits128: [14, 113, 8191],
    },
        // Local variables
    _isBigEndian:      false,
    _exponentBitCount: 8,
    _fractionBitCount: 23,
    _bias:             127,

        // Get/Set Bit order
    isBigEndian: function(value) {
        if (value === undefined) {
            return this._isBigEndian;
        } else {
            this._isBigEndian = ((value === true) || (value === 1));
        }
    },

        //
    setBitCount: function(value) {
        if (isNaN(value)) {
            throw 'Parameter is not a number!';
        }
        var _bits = null;
        switch (value) {
            case 16:  _bits = this.bitFormats.bits16;  break;
            case 32:  _bits = this.bitFormats.bits32;  break;
            case 64:  _bits = this.bitFormats.bits64;  break;
            case 128: _bits = this.bitFormats.bits128; break;
            default:  throw 'Invalid parameter value!';
        }
        this._exponentBitCount   = _bits[0];
        this._fractionBitCount   = _bits[1];
        this._bias               = _bits[2];
    },

        // Set value from bytes
    setValue: function(bytes) {
        if (this._isBigEndian) {
            bytes                = bytes.reverse();
        }
        // Convert bytes to bit string
        var str                  = '';
        bytes.forEach(byte => {
           str                  += byte.toString(2).padStart(8, '0');
        });
        // Split into sign, exponent and fraction bits
        var sign                 = (str.charAt(0) === '0')? 1: -1;;
        var exponentStr          = str.substr(1, this._exponentBitCount);
        var fractionStr          = str.substr(1 + this._exponentBitCount);
        // Compute exponent
        var exponent             = Math.pow(2, (parseInt(exponentStr, 2) - this._bias));
        // Conpute fraction
        var fraction             = 0.0;
        var fractionRef          = 1.0;
        var fractionArray        = fractionStr.split("");
        fractionArray.forEach(c => {
            fractionRef         *= 0.5;
            fraction            += (fractionRef * parseInt(c));
        });
        // Combine and return values
        return (sign * exponent * (1 + fraction));
    },

        // Set bytes from value
    setBytes: function(value) {
        var str                  = (value >= 0.0)? '0': '1';
        var workValue            = Math.abs(value);
        //
        if (value === 0.0) {
            str                 += ''.padLeft(this._exponentBitCount, '0');
            str                 += ''.padLeft(this._fractionBitCount, '0');
        } else {
            var exponent         = Math.floor(Math.log2(Math.abs(workValue)));
            var fraction         = (workValue / Math.pow(2, exponent)) - 1.0;

            str                 += (this._bias + exponent).toString(2).padStart(this._exponentBitCount, '0');
                // Round fraction to nearest bit depth
            var roundValue       = 0.5;
            for (let i = 0; i < this._fractionBitCount; i++) {
                roundValue      *= 0.5;
            }
            fraction            += roundValue;
                // Build fraction bits
            var fractionRef      = 1.0;
            var fractionStr      = '';
            for (let i = 0; i < this._fractionBitCount; i++) {
                fractionRef     *= 0.5;
                if (fraction > fractionRef){
                    fractionStr += '1';
                    fraction    -= fractionRef;
                } else {
                    fractionStr += '0';
                }
            }
            str                 += fractionStr;
        }
        return this.setByteArray(str);
    },

        // Convert bits string to bytes
    setByteArray: function(str) {
        var bytes               = [];
        for (let i = 0; i < str.length; i += 8) {
            var byteStr         = str.substr(i, 8);
            var byte            = parseInt(byteStr, 2);
            bytes.push(byte);
        }
        if (this._isBigEndian) {
            bytes               = bytes.reverse();
        }
        return bytes;
    },

};
