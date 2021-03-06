function() {

// define forge
if(typeof(window) !== 'undefined') {
  var forge = window.forge = window.forge || {};
}
// define node.js module
else if(typeof(module) !== 'undefined' && module.exports) {
  var forge = {
    asn1: require('./asn1'),
    md: {
      sha1: require('./sha1')
    },
    pkcs7: {
      asn1: require('./pkcs7asn1')
    },
    pki: require('./pki'),
    util: require('./util')
  };
  module.exports = forge.pkcs12 = {};
}

// shortcut for asn.1 & PKI API
var asn1 = forge.asn1;
var pki = forge.pki;
var oids = pki.oids;

// shortcut for PKCS#12 API
var p12 = forge.pkcs12 = forge.pkcs12 || {};

var contentInfoValidator = {
  name: 'ContentInfo',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,  // a ContentInfo
  constructed: true,
  value: [{
    name: 'ContentInfo.contentType',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OID,
    constructed: false,
    capture: 'contentType'
  }, {
    name: 'ContentInfo.content',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    constructed: true,
    captureAsn1: 'content'
  }]
};

var pfxValidator = {
  name: 'PFX',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'PFX.version',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'version'
  },
  contentInfoValidator, {
    name: 'PFX.macData',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    optional: true,
    value: [{
      name: 'PFX.macData.mac',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,  // DigestInfo
      constructed: true,
      value: [{
        name: 'PFX.macData.mac.digestAlgorithm',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.SEQUENCE,  // DigestAlgorithmIdentifier
        constructed: true,
        value: [{
          name: 'PFX.macData.mac.digestAlgorithm.algorithm',
          tagClass: asn1.Class.UNIVERSAL,
          type: asn1.Type.OID,
          constructed: false,
          capture: 'macAlgorithm'
        }, {
          name: 'PFX.macData.mac.digestAlgorithm.parameters',
          tagClass: asn1.Class.UNIVERSAL,
          captureAsn1: 'macAlgorithmParameters'
        }]
      }, {
        name: 'PFX.macData.mac.digest',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OCTETSTRING,
        constructed: false,
        capture: 'macDigest'
      }]
    }, {
      name: 'PFX.macData.macSalt',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OCTETSTRING,
      constructed: false,
      capture: 'macSalt'
    }, {
      name: 'PFX.macData.iterations',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.INTEGER,
      constructed: false,
      optional: true,
      capture: 'macIterations'
    }]
  }]
};

var safeBagValidator = {
  name: 'SafeBag',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'SafeBag.bagId',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OID,
    constructed: false,
    capture: 'bagId'
  }, {
    name: 'SafeBag.bagValue',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    constructed: true,
    captureAsn1: 'bagValue'
  }, {
    name: 'SafeBag.bagAttributes',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SET,
    constructed: true,
    optional: true,
    captureAsn1: 'bagAttributes'
  }]
};

var certBagValidator = {
  name: 'CertBag',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'CertBag.certId',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OID,
    constructed: false,
    capture: 'certId'
  }, {
    name: 'CertBag.certValue',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    constructed: true,
    /* So far we only support X.509 certificates (which are wrapped in
       a OCTET STRING, hence hard code that here). */
    value: [{
      name: 'CertBag.certValue[0]',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Class.OCTETSTRING,
      constructed: false,
      capture: 'cert'
    }]
  }]
};


/**
 * Converts a PKCS#12 PFX in ASN.1 notation into a PFX object.
 *
 * @param obj The PKCS#12 PFX in ASN.1 notation.
 * @param {String} password Password to decrypt with (optional)
 *
 * @return PKCS#12 PFX object.
 */
p12.pkcs12FromAsn1 = function(obj, password) {
  // validate PFX and capture data
  var capture = {};
  var errors = [];
  if(!asn1.validate(obj, pfxValidator, capture, errors)) {
    throw {
      message: 'Cannot read PKCS#12 PFX. ' +
        'ASN.1 object is not an PKCS#12 PFX.',
      errors: errors
    };
  }

  var pfx = {
    version: capture.version.charCodeAt(0),
    safeContents: []
  };

  if(capture.version.charCodeAt(0) !== 3) {
    throw {
      message: 'PKCS#12 PFX of version other than 3 not supported.',
      version: capture.version.charCodeAt(0)
    }
  }

  if(asn1.derToOid(capture.contentType) !== oids.data) {
    throw {
      message: 'Only PKCS#12 PFX in password integrity mode supported.',
      oid: asn1.derToOid(capture.contentType)
    };
  }

  var data = capture.content.value[0];
  if(data.tagClass !== asn1.Class.UNIVERSAL ||
     data.type !== asn1.Type.OCTETSTRING) {
    throw {
      message: 'PKCS#12 authSafe content data is not a OCTET STRING'
    };
  }

  _decodeAuthenticatedSafe(pfx, data.value, password);
  return pfx;
}

/**
 * Decode PKCS#12 AuthenticatedSafe (BER encoded) into PFX object.
 *
 * The AuthenticatedSafe is a BER-encoded SEQUENCE OF ContentInfo.
 *
 * @param pfx The PKCS#12 PFX object to fill.
 * @param {String} authSafe BER-encoded AuthenticatedSafe
 * @param {String} password Password to decrypt with (optional)
 * @return void
 */
function _decodeAuthenticatedSafe(pfx, authSafe, password) {
  authSafe = asn1.fromDer(authSafe);  /* actually it's BER encoded */

  if(authSafe.tagClass !== asn1.Class.UNIVERSAL ||
     authSafe.type !== asn1.Type.SEQUENCE ||
     authSafe.constructed !== true) {
    throw {
      message: 'PKCS#12 AuthenticatedSafe expected to be a ' +
        'SEQUENCE OF ContentInfo'
    }
  }

  for(var i = 0; i < authSafe.value.length; i ++) {
    var contentInfo = authSafe.value[i];

    // validate contentInfo and capture data
    var capture = {};
    var errors = [];
    if(!asn1.validate(contentInfo, contentInfoValidator, capture, errors)) {
      throw {
        message: 'Cannot read ContentInfo. ',
        errors: errors
      };
    }

    var obj = {
      encrypted: false
    };
    var safeContents = null;
    switch(asn1.derToOid(capture.contentType)) {
      case oids.data:
        var data = capture.content.value[0];
        if(data.tagClass !== asn1.Class.UNIVERSAL ||
           data.type !== asn1.Type.OCTETSTRING) {
          throw {
            message: 'PKCS#12 SafeContents Data is not a OCTET STRING'
          };
        }
        safeContents = data.value;
        break;

      case oids.encryptedData:
        var data = capture.content.value[0];
        safeContents = _decryptSafeContents(data, password);
        obj.encrypted = true;
        break;

      default:
        throw {
          message: 'Unsupported PKCS#12 contentType.',
          contentType: asn1.derToOid(capture.contentType)
        };
    }

    obj.safeBags = _decodeSafeContents(safeContents, password);
    pfx.safeContents.push(obj);
  }
}

/**
 * Decrypt PKCS#7 EncryptedData structure
 *
 * @param data ASN.1 encoded EncryptedContentInfo object
 * @param password The user-provided password
 * @return The decrypted SafeContents (ASN.1 object)
 */
function _decryptSafeContents(data, password) {
  var capture = {};
  var errors = [];
  if(!asn1.validate(data, forge.pkcs7.asn1.encryptedDataValidator, capture, errors)) {
    throw {
      message: 'Cannot read EncryptedContentInfo. ',
      errors: errors
    };
  }

  var oid = asn1.derToOid(capture.contentType);
  if(oid !== oids.data) {
    throw {
      message: 'PKCS#12 EncryptedContentInfo ContentType is not Data.',
      oid: oid
    };
  }

  // get cipher
  oid = asn1.derToOid(capture.encAlgorithm);
  var cipher = pki.pbe.getCipher(oid, capture.encParameter, password);

  // get encrypted data
  var encrypted = forge.util.createBuffer(capture.encContent);

  cipher.update(encrypted);
  if(!cipher.finish()) {
    throw {
      message: 'Failed to decrypt PKCS#12 SafeContents.'
    };
  }

  return cipher.output.getBytes();
}

/**
 * Decode PKCS#12 SafeContents (BER-encoded) into array of Bag objects.
 *
 * The safeContents is a BER-encoded SEQUENCE OF SafeBag
 *
 * @param {String} safeContents BER-encoded safeContents
 * @param {String} password Password to decrypt with (optional)
 * @return {Array} Array of Bag objects.
 */
function _decodeSafeContents(safeContents, password) {
  safeContents = asn1.fromDer(safeContents);  /* actually it's BER-encoded. */

  if(safeContents.tagClass !== asn1.Class.UNIVERSAL ||
     safeContents.type !== asn1.Type.SEQUENCE ||
     safeContents.constructed !== true) {
    throw {
      message: 'PKCS#12 SafeContents expected to be a ' +
        'SEQUENCE OF SafeBag'
    }
  }

  var res = [];
  for(var i = 0; i < safeContents.value.length; i++) {
    var safeBag = safeContents.value[i];

    // validate SafeBag and capture data
    var capture = {};
    var errors = [];
    if(!asn1.validate(safeBag, safeBagValidator, capture, errors)) {
      throw {
        message: 'Cannot read SafeBag.',
        errors: errors
      };
    }

    /* Create bag object and push to result array. */
    var bag = {
      type: asn1.derToOid(capture.bagId)
    };
    res.push(bag);

    var validator, decoder;
    var bagAsn1 = capture.bagValue.value[0];
    switch(bag.type) {
      case oids.pkcs8ShroudedKeyBag:
        /* bagAsn1 has a EncryptedPrivateKeyInfo, which we need to decrypt.
           Afterwards we can handle it like a keyBag,
           which is a PrivateKeyInfo. */
        if(password === undefined) {
          throw {
            message: 'Found PKCS#8 ShroudedKeyBag but no password available.'
          };
        }

        bagAsn1 = pki.decryptPrivateKeyInfo(bagAsn1, password);
        if(bagAsn1 === null) {
          throw {
            message: 'Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?'
          };
        }

        /* fall through */
      case oids.keyBag:
        /* A PKCS#12 keyBag is a simple PrivateKeyInfo as understood by our
           PKI module, hence we don't have to do validation/capturing here,
           just pass what we already got. */
        bag.key = pki.privateKeyFromAsn1(bagAsn1);
        continue;  /* Nothing more to do. */

      case oids.certBag:
        /* A PkCS#12 certBag can wrap both X.509 and sdsi certificates.
           Therefore put the SafeBag content through another validator to
           capture the fields.  Afterwards check & store the results. */
        validator = certBagValidator;
        decoder = function() {
          if(asn1.derToOid(capture.certId) !== oids.x509Certificate) {
            throw {
              message: 'Unsupported certificate type, only X.509 supported.',
              oid: asn1.derToOid(capture.certId)
            };
          }

          bag.cert = pki.certificateFromAsn1(asn1.fromDer(capture.cert));
        };
        break;

      default:
        throw {
          message: 'Unsupported PKCS#12 SafeBag type.',
          oid: bag.type
        };
    };

    /* Validate SafeBag value (i.e. CertBag, etc.) and capture data if needed. */
    if(validator !== undefined &&
       !asn1.validate(bagAsn1, validator, capture, errors)) {
      throw {
        message: 'Cannot read PKCS#12 ' + validator.name,
        errors: errors
      };
    }

    /* Call decoder function from above to store the results. */
    decoder();
  }

  return res;
}


/**
 * Wraps a private key and certificate in a PKCS#12 PFX wrapper. If a
 * password is provided then the private key will be encrypted.
 *
 * @todo implement password-based-encryption for the whole package
 *
 * @param key the private key.
 * @param cert the certificate.
 * @param password the password to use.
 *
 * @return the PKCS#12 PFX ASN.1 object.
 */
p12.toPkcs12Asn1 = function(key, cert, password) {

  // create safe bag for private key
  var keyBag = null;
  if(key !== null) {
    var pkAsn1 = pki.wrapRsaPrivateKey(pki.privateKeyToAsn1(key));
    if(password === null) {
      // no encryption
      keyBag = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // bagId
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
          asn1.oidToDer(oids['keyBag']).getBytes()),
        // bagValue
        asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
          // PrivateKeyInfo
          pkAsn1
        ])
        // bagAttributes (OPTIONAL)
      ]);
    }
    else {
      // encrypted PrivateKeyInfo
      keyBag = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // bagId
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
          asn1.oidToDer(oids['pkcs8ShroudedKeyBag']).getBytes()),
        // bagValue
        asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
          // EncryptedPrivateKeyInfo
          pki.encryptPrivateKeyInfo(pkAsn1, password)
        ])
        // bagAttributes (OPTIONAL)
      ]);
    }
  }

  // create safe bag for certificate
  if(cert !== null) {
    var certAsn1 = pki.certificateToAsn1(cert);
    var certSafeBag =
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // bagId
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
          asn1.oidToDer(oids['certBag']).getBytes()),
        // bagValue
        asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
          // CertBag
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
            // certId
            asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
              asn1.oidToDer(oids['x509Certificate']).getBytes()),
            // certValue (x509Certificate)
            asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
              asn1.create(
                asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false,
                asn1.toDer(certAsn1).getBytes())
            ])])])
        // bagAttributes (OPTIONAL)
      ]);
  }

  // create SafeContents
  var bags = [];
  if(key !== null) {
    bags.push(keyBag);
  }
  if(cert !== null) {
    bags.push(certSafeBag);
  }
  var safeContents =
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, bags);

  // create AuthenticatedSafe
  var safe = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // PKCS#7 ContentInfo
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // contentType
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        // OID for the content type is 'data'
        asn1.oidToDer(oids['data']).getBytes()),
      // content
      asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
        asn1.create(
          asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false,
          asn1.toDer(safeContents).getBytes())
      ])
    ])
  ]);

  // PFX
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version (3)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      String.fromCharCode(0x03)),
    // PKCS#7 ContentInfo
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // contentType
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        // OID for the content type is 'data'
        asn1.oidToDer(oids['data']).getBytes()),
      // content
      asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
        asn1.create(
          asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false,
          asn1.toDer(safe).getBytes())
      ])
    ])
  ]);
};

/**
 * PKCS#12 key derivation
 *
 * @param {String} password The password to derive the key material from
 * @param {ByteBuffer} salt The salt to use
 * @param {int} id The PKCS#12 ID byte (1 = key material, 2 = IV, 3 = MAC)
 * @param {int} iter The iteration count
 * @param {int} n Number of bytes to derive from the password
 * @param md The message digest to use, defaults to SHA-1.
 * @return {ByteBuffer} The bytes derived from the password
 */
p12.generateKey = function(password, salt, id, iter, n, md) {
  var j, l;

  if(typeof(md) === 'undefined' || md === null) {
    md = forge.md.sha1.create();
  }

  var u = md.digestLength;
  var v = md.blockLength;
  var result = new forge.util.ByteBuffer();

  /* Convert password to Unicode byte buffer + trailing 0-byte. */
  var passBuf = new forge.util.ByteBuffer();
  for(l = 0; l < password.length; l++) {
    passBuf.putInt16(password.charCodeAt(l));
  }
  passBuf.putInt16(0);

  /* Length of salt and password in BYTES. */
  var p = passBuf.length();
  var s = salt.length();

  /* 1. Construct a string, D (the ???diversifier???), by concatenating
        v copies of ID. */
  var D = new forge.util.ByteBuffer();
  D.fillWithByte(id, v);

  /* 2. Concatenate copies of the salt together to create a string S of length
        v??????s/v??? bytes (the final copy of the salt may be truncated to create S).
        Note that if the salt is the empty string, then so is S. */
  var Slen = v * Math.ceil(s / v);
  var S = new forge.util.ByteBuffer();
  for(l = 0; l < Slen; l ++) {
    S.putByte(salt.at(l % s));
  }

  /* 3. Concatenate copies of the password together to create a string P of
        length v??????p/v??? bytes (the final copy of the password may be truncated
        to create P).
        Note that if the password is the empty string, then so is P. */
  var Plen = v * Math.ceil(p / v);
  var P = new forge.util.ByteBuffer();
  for(l = 0; l < Plen; l ++) {
    P.putByte(passBuf.at(l % p));
  }

  /* 4. Set I=S||P to be the concatenation of S and P. */
  var I = S;
  I.putBuffer(P);

  /* 5. Set c=???n/u???. */
  var c = Math.ceil(n / u);

  /* 6. For i=1, 2, ..., c, do the following: */
  for(var i = 1; i <= c; i ++) {
    /* a) Set Ai=H^r(D||I). (l.e. the rth hash of D||I, H(H(H(...H(D||I)))) */
    var buf = new forge.util.ByteBuffer();
    buf.putBytes(D.bytes());
    buf.putBytes(I.bytes());
    for(var round = 0; round < iter; round ++) {
      md.start();
      md.update(buf.getBytes());
      buf = md.digest();
    }

    /* b) Concatenate copies of Ai to create a string B of length v bytes (the
          final copy of Ai may be truncated to create B). */
    var B = new forge.util.ByteBuffer();
    for(l = 0; l < v; l ++) {
      B.putByte(buf.at(l % u));
    }

    /* c) Treating I as a concatenation I0, I1, ..., Ik-1 of v-byte blocks,
          where k=???s/v???+???p/v???, modify I by setting Ij=(Ij+B+1) mod 2v
          for each j.  */
    var k = Math.ceil(s / v) + Math.ceil(p / v);
    var Inew = new forge.util.ByteBuffer();
    for(j = 0; j < k; j ++) {
      var chunk = new forge.util.ByteBuffer(I.getBytes(v));
      var x = 0x1ff;
      for(l = B.length() - 1; l >= 0; l --) {
        x = x >> 8;
        x += B.at(l) + chunk.at(l);
        chunk.setAt(l, x & 0xff);
      }
      Inew.putBuffer(chunk);
    }
    I = Inew;

    /* Add Ai to A. */
    result.putBuffer(buf);
  }

  result.truncate(result.length() - n);
  return result;
};

}