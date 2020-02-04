import React from 'react';

export default class CryptoComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          keyPair: {},
          options: {
            name: "ECDSA",
            namedCurve:  'P-384',
          },
          keyUsage: ["sign", "verify"],
          message: "",
          signature: "",
          signatureBase: "",
          ciphertext: "",
          decrypted: "",
          publicKey: null,
          k: "ecdsa"
        }
      }

      switchAlgorithm = (type) => {
        if (type === 'ecdsa') {
            this.setState({options: {
                name: "ECDSA",
                namedCurve:  'P-384',
              }})
          } else if (type === 'rsa') {
            this.setState({options: {
                name: "RSA-OAEP", // name: "RSA-PSS",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
              }})
          } else {
              throw new Error('Unknown algorithm '+type+'. Must be ECDSA or RSA.')
          }
      }
    
      switchUsage = (type) => {
          if (type === 'ecdsa') {
            this.setState({keyUsage: ["sign", "verify"]})
          } else if (type === 'rsa') {
            this.setState({ keyUsage: ["encrypt", "decrypt"] })
          } else {
              throw new Error('Unknown usage '+type+'. Must be ECDSA or RSA.')
          }
      }
    
      componentDidUpdate(prevProps, prevState) {
        document.getElementsByClassName('row')[document.getElementsByClassName('row').length-1].scrollIntoView({ behavior: 'smooth' });

        if ( this.props.type !== prevProps.type ) {
            this.switchUsage(this.props.type)
            this.switchAlgorithm(this.props.type)
        }    
    }
      
      /*
      Convert  an ArrayBuffer into a string
      from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
      */
      ab2str = (buf) => {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
      }
    
      /*
      Convert a string into an ArrayBuffer
      from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
      */
      str2ab = (str) => {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      }
    
      /*
      Export the given key and write it into the "exported-key" space.
      */
      exportPrivateKey = async (key) => {
        const exported = await window.crypto.subtle.exportKey(
          "pkcs8",
          key
        );
        const exportedAsString = this.ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
        document.getElementById('privateKeyValue').value = pemExported
        this.setState({pemPrivate: pemExported})
      }
      exportPublicKey = async (key) => {
        const exported = await window.crypto.subtle.exportKey(
          "spki",
          key
        );
        const exportedAsString = this.ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
        document.getElementById('publicKeyValue').value = pemExported
        this.setState({pemPublic: pemExported})
      }
      // exportCryptoKey = async (key) => {
      //   const exported = await window.crypto.subtle.exportKey(
      //     "raw",
      //     key
      //   );
      //   const exportedKeyBuffer = new Uint8Array(exported);
      //   console.log(exportedKeyBuffer)
      //   this.setState({exportedKeyBuffer})
      // }
      /*
      Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      Takes a string containing the PEM encoded key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      // importPrivateKey = async () => {
      //   // fetch the part of the PEM string between header and footer
      //   const pemHeader = "-----BEGIN PRIVATE KEY-----";
      //   const pemFooter = "-----END PRIVATE KEY-----";
      //   const pemContents = this.state.pemPrivate.substring(pemHeader.length, this.state.pemPrivate.length - pemFooter.length);
      //   // base64 decode the string to get the binary data
      //   const binaryDerString = window.atob(pemContents);
      //   // convert from a binary string to an ArrayBuffer
      //   const binaryDer = this.str2ab(binaryDerString);
    
      //   await window.crypto.subtle.importKey(
      //     "pkcs8",
      //     binaryDer,
      //     {
      //       name: "RSA-OAEP",
      //       hash: "SHA-256",
      //     },
      //     true,
      //     ["decrypt"]
      //   ).then(privateKey => {
      //     console.log(privateKey)
      //     this.setState({privateKey})
      //   }).catch(err => console.log(err));
      // }
      // /*
      // Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      // Takes a string containing the PEM encoded key, and returns a Promise
      // that will resolve to a CryptoKey representing the private key.
      // */
      // importPublicKey = async () => {
      //   // fetch the part of the PEM string between header and footer
      //   const pemHeader = "-----BEGIN PUBLIC KEY-----";
      //   const pemFooter = "-----END PUBLIC KEY-----";
      //   const pemContents = this.state.pemPublic.substring(pemHeader.length, this.state.pemPublic.length - pemFooter.length);
      //   // base64 decode the string to get the binary data
      //   const binaryDerString = window.atob(pemContents);
      //   // convert from a binary string to an ArrayBuffer
      //   const binaryDer = this.str2ab(binaryDerString);
    
      //   console.log(binaryDer, 'binaryDer')
    
      //   await window.crypto.subtle.importKey(
      //     "spki",
      //     binaryDer,
      //     {
      //       name: "RSA-OAEP",
      //       hash: "SHA-256",
      //     },
      //     true,
      //     ["encrypt"]
      //   ).then(publicKey => {
      //     this.setState({publicKey})
      //   }).catch(err => console.log(err));
      // }
      /*
      Fetch the contents of the "message" textbox, and encode it
      in a form we can use for the sign operation.
      */
      signMessage = async () => {
        let encoded = this.getMessageEncoding();
        await window.crypto.subtle.sign(
          {
            name: "ECDSA",
            hash: {name: "SHA-384"},
          },
          this.state.keyPair.privateKey,
          encoded
        ).then(signature => {
          const exportedAsString = this.ab2str(signature);
          const signatureBase = window.btoa(exportedAsString)
          this.setState({signature, signatureBase})
        }).catch(err => console.log(err));
      }
    
      verifySignature = async () => {
        let encoded = this.getMessageEncoding();
        await window.crypto.subtle.verify(
          {
            name: "ECDSA",
            hash: {name: "SHA-384"},
          },
          this.state.keyPair.publicKey,
          this.state.signature,
          encoded
        ).then(valid => valid ? (
          document.getElementById("verify").innerHTML = "Signature is valid",
          document.getElementById("verify").classList.add("alert", "alert-success"),
          document.getElementById("verify").classList.remove("alert-danger")
         )
        : (
          document.getElementById("verify").innerHTML = "Signature is invalid",
          document.getElementById("verify").classList.add("alert", "alert-danger"),
          document.getElementById("verify").classList.remove("alert-success")
          )
        ).catch(err => console.log(err));
      }
    
      encryptMessage = async () => {
        await this.importPublicKey()
        let encoded = this.getMessageEncoding();
        await console.log(this.state.publicKey)
        await window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP",
          },
          this.state.publicKey,
          encoded
        ).then(cipher => {
          const exportedAsString = this.ab2str(cipher);
          const ciphertext = window.btoa(exportedAsString)
          this.setState({ciphertext, cipher})
        }).catch(err => console.log(err));
      }
    
      decryptMessage = async () => {
        await this.importPrivateKey()
        await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP"
          },
          this.state.privateKey,
          this.state.cipher
        )
        .then(decrypted => {
          const exportedAsString = this.ab2str(decrypted);
          console.log(exportedAsString)
          this.setState({decrypted: exportedAsString})
        }).catch(err => console.log(err));
      }
    
      getMessageEncoding = () => {
        let message = this.state.message;
        let enc = new TextEncoder();
        
        return enc.encode(message);
      }
    
      handleKeyGen = async () => {
        console.log(this.state)
        /*
        Generate a sign/verify key pair
        */
        await window.crypto.subtle.generateKey(
          this.state.options,
          true,
          this.state.keyUsage,
        ).then((keyPair) => {
          this.setState({keyPair});
          this.renderKeys()
        }).catch(err => console.log(err))
      }
    
      renderKeys = () => {
        this.exportPrivateKey(this.state.keyPair.privateKey)
        this.exportPublicKey(this.state.keyPair.publicKey)
      }
    
    render() {
        return (
            <>
                <div className="row justify-content-md-center">
                    <div className="col-md-auto col-md-6">
                        <div>
                            <button style={{marginTop: '50px'}} onClick={this.handleKeyGen}>Generate key pair</button>
                            <div className="row flex-lg-row justify-content-between">
                            <div className="form-group col-6">
                                <label htmlFor="privateKeyValue">Private key</label>
                                <textarea className="form-control" id="privateKeyValue" rows="10"></textarea>
                                <small>* Keep it secret and use it for creating digital signatures.</small>
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="publicKeyValue">Public key</label>
                                <textarea className="form-control" id="publicKeyValue" rows="10"></textarea>
                                <small>* Share it with your contacts so they can verify your digital signatures.</small>
                            </div>
                            </div>
                            <div className="row flex-lg-row justify-content-between">
                            <div className="form-group col-12">
                                <label htmlFor="plainTextMessage">Message</label>
                                <textarea className="form-control" id="plainTextMessage" rows="3" onChange={e => this.setState({message: e.currentTarget.value})}></textarea>
                            </div>
                            <button onClick={this.signMessage}>Sign message</button>
                            </div>
                            { this.state.signatureBase.length > 0 ?
                            (  <>
                                <br />
                                <br />
                                <br />
                                <br />
                                <div className="row flex-lg-row justify-content-between">
                                Signature:
                                <div className="col-8">
                                    <p style={{wordBreak: 'break-all'}} id="signedMessage">{this.state.signatureBase}</p>
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                    <button onClick={this.verifySignature}>Verify Signature</button>
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                </div>
                                </div>
                            </>)
                            :
                            ""
                            }
                            <p id="verify"></p>
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                            { this.state.ciphertext.length > 0 ?
                            (  <>
                                <br />
                                <br />
                                <br />
                                <br />
                                <div className="row flex-lg-row justify-content-between">
                                Ciphertext:
                                <div className="col-8">
                                    <p style={{wordBreak: 'break-all'}} id="encryptedMessage">{this.state.ciphertext}</p>
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                    <button onClick={this.decryptMessage}>Decrypt message</button>
                                    <br />
                                    <br />
                                    <br />
                                    <br />
                                </div>
                                </div>
                            </>)
                            :
                            ""
                            }
                            { this.state.decrypted.length > 0 ?
                            (  <>
                                <br />
                                <br />
                                <br />
                                <br />
                                <div className="row flex-lg-row justify-content-between">
                                Decrypted message:
                                <div className="col-8">
                                    <p style={{wordBreak: 'break-all'}} id="decryptedMessage">{this.state.decrypted}</p>
                                </div>
                                <br />
                                <br />
                                <br />
                                <br />
                                </div>
                            </>)
                            :
                            ""
                            }
                        </div>

                        {/* <form>
                            <div className="form-group">
                            <label htmlFor="exampleFormControlInput1">Email address</label>
                            <input type="email" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com"/>
                            </div>
                            <div className="form-group">
                            <label htmlFor="exampleFormControlSelect1">Example select</label>
                            <select className="form-control" id="exampleFormControlSelect1">
                                <option>ECDH</option>
                                <option>AES</option>
                                <option>RSA</option>
                                <option>HMAG</option>
                            </select>
                            </div>
                            <div className="form-group">
                            <label htmlFor="exampleFormControlTextarea1">Example textarea</label>
                            <textarea className="form-control" id="" rows="3"></textarea>
                            </div>
                        </form> */}
                    </div>
                </div> 
            </>
        )
    }
}