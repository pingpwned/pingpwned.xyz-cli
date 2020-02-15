import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import U2f from './U2f' 
import './App.css';

// TODO: Reaactoring - generate ECDSA format key and import for encrypt/decryt

export default class App extends React.Component {
  constructor(){
    super();
    this.state = {
      keyPair: {},
      message: "",
      signature: "",
      signatureBase: "",
      ciphertext: "",
      decrypted: "",
      publicKey: null,
      pemPrivate: "",
      pemPublic: "",
      k: "ecdsa",
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
    // document.getElementById('privateKeyValue').value = pemExported
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
    // document.getElementById('publicKeyValue').value = pemExported
    this.setState({pemPublic: pemExported})
  }
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
      document.getElementById("verify").classList.remove("alert-danger"),
      this.setState({valid})
     )
    : (
      document.getElementById("verify").innerHTML = "Signature is invalid",
      document.getElementById("verify").classList.add("alert", "alert-danger"),
      document.getElementById("verify").classList.remove("alert-success"),
      this.setState({valid})
      )
    ).catch(err => console.log(err));
  }

  encryptMessage = async () => {
    let encoded = this.getMessageEncoding();
    await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      this.state.keyPair.publicKey,
      encoded
    ).then(cipher => {
      const exportedAsString = this.ab2str(cipher);
      const ciphertext = window.btoa(exportedAsString)
      this.setState({ciphertext, cipher})
    }).catch(err => console.log(err));
  }

  decryptMessage = async () => {
    await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      this.state.keyPair.privateKey,
      this.state.cipher
    )
    .then(decrypted => {
      const exportedAsString = this.ab2str(decrypted);
      this.setState({decrypted: exportedAsString})
    }).catch(err => console.log(err));
  }

  getMessageEncoding = () => {
    let message = this.state.message;
    let enc = new TextEncoder();
    
    return enc.encode(message);
  }

  handleKeyGenSign = async () => {
    /*
    Generate a sign/verify key pair
    */
    await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve:  'P-384',
      },
      true,
      ["sign", "verify"],
    ).then((keyPair) => {
      this.setState({keyPair});
      this.renderKeysSign()
    }).catch(err => console.log(err))
  }

  handleKeyGenVerify = async () => {
    /*
    Generate a sign/verify key pair
    */
    await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP", // name: "RSA-PSS",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
      true,
      ["encrypt", "decrypt"],
    ).then((keyPair) => {
      this.setState({keyPair});
      this.renderKeysVerify()
    }).catch(err => console.log(err))
  }

  renderKeysSign = () => {
    this.exportPrivateKey(this.state.keyPair.privateKey)
    this.exportPublicKey(this.state.keyPair.publicKey)
  }

  renderKeysVerify = () => {
    this.exportPrivateKey(this.state.keyPair.privateKey)
    this.exportPublicKey(this.state.keyPair.publicKey)
  }

  componentDidUpdate(prevProps, prevState) {
    if ( this.state.k !== prevState.k ) {
      this.setState({
        keyPair: {},
        message: "",
        signature: "",
        signatureBase: "",
        ciphertext: "",
        decrypted: "",
        publicKey: null,
        pemPrivate: "",
        pemPublic: "",
      })
      document.getElementById("verify").innerHTML = ""
      document.getElementById("verify").classList.remove("alert", "alert-success", "alert-danger")
    }
    if (Object.keys(this.state.keyPair).length > 0) {
        document.querySelectorAll('footer')[document.querySelectorAll('footer').length-1].scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    return (
      <>
        <div className="App">
          <main>
            <div className="container">
              <div className="row justify-content-md-center">
                <div className="col-md-auto col-md-12">
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <h3>Crypto examples</h3>
                  <br/>
                  <br/>
                  <Tabs defaultActiveKey="ecdsa" id="uncontrolled-tab-example" onSelect={k => this.setState({k})}>
                    <Tab eventKey="ecdsa" title="Digital signature">
                      <div className="row justify-content-md-center ecdsa">
                        <div className="col-md-auto col-md-6">
                          <div>
                            <button className="btn btn-outline-info" style={{marginTop: '50px'}} onClick={this.handleKeyGenSign}>Generate key pair</button>
                            <div className="row flex-lg-row justify-content-between">
                              <div className="form-group col-6">
                                <label htmlFor="privateKeyValue">Private key</label>
                                <textarea className="form-control" id="privateKeyValue" rows="10" defaultValue={this.state.pemPrivate}></textarea>
                                <small>* Keep it secret and use it for creating digital signatures.</small>
                              </div>
                              <div className="form-group col-6">
                                <label htmlFor="publicKeyValue">Public key</label>
                                <textarea className="form-control" id="publicKeyValue" rows="10" defaultValue={this.state.pemPublic}></textarea>
                                <small>* Share it with your contacts so they can verify your digital signatures.</small>
                              </div>
                            </div>
                            <div className="row flex-lg-row justify-content-between">
                              <div className="form-group col-12">
                                <label htmlFor="plainTextMessage">Message</label>
                                <textarea className="form-control" id="plainTextMessage" rows="3" onChange={e => this.setState({message: e.currentTarget.value})} value={this.state.message}></textarea>
                              </div>
                              <div className="col-12">
                                <div  className="btn-group" role="group">
                                  <button className="btn btn-outline-secondary" onClick={this.signMessage}>Sign message</button>
                                </div>
                              </div>
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
                                  </div>
                                  <div className="col-12">
                                    <div  className="btn-group" role="group">
                                      <button className="btn btn-outline-secondary" onClick={this.verifySignature}>Verify Signature</button>
                                    </div>
                                  </div>  
                                  <br />
                                  <br />
                                  <br />
                                </div>
                              </>)
                              :
                              ""
                            }
                            <p id="verify"></p>
                            <br />
                            <br />
                          </div>
                        </div>
                      </div>  
                    </Tab>
                    <Tab eventKey="rsa" title="Message encryption">
                      <div className="row justify-content-md-center">
                        <div className="col-md-auto col-md-6">
                          <div>
                          <div className="col-12">
                            <div  className="btn-group" role="group">
                              <button className="btn btn-outline-info" style={{marginTop: '50px'}} onClick={this.handleKeyGenVerify}>Generate key pair</button>
                            </div>
                          </div>  
                            <div className="row flex-lg-row justify-content-between">
                              <div className="form-group col-6">
                                <label htmlFor="privateKeyValue">Private key</label>
                                <textarea className="form-control" id="privateKeyValue" rows="10" defaultValue={this.state.pemPrivate}></textarea>
                                <small>* Keep it secret and use for decrypting your messages.</small>
                              </div>
                              <div className="form-group col-6">
                                <label htmlFor="publicKeyValue">Public key</label>
                                <textarea className="form-control" id="publicKeyValue" rows="10" defaultValue={this.state.pemPublic}></textarea>
                                <small>* Share it with your contacts so they can encrypt messages before sending it to you. You can decrypt these messages with your private key.</small>
                              </div>
                            </div>
                            <div className="row flex-lg-row justify-content-between">
                              <div className="form-group col-12">
                                <label htmlFor="plainTextMessage">Message</label>
                                <textarea className="form-control" id="plainTextMessage" rows="3" onChange={e => this.setState({message: e.currentTarget.value})} value={this.state.message}></textarea>
                              </div>
                              <div className="col-12">
                                <div  className="btn-group" role="group">
                                  <button className="btn btn-outline-secondary" onClick={this.encryptMessage}>Encrypt message</button>
                                </div>
                              </div>
                            </div>
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
                                  </div>
                                  <div className="col-12">
                                    <div  className="btn-group" role="group">
                                      <button className="btn btn-outline-secondary" onClick={this.decryptMessage}>Decrypt message</button>
                                    </div>
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
                            { this.state.decrypted.length > 0 ?
                            (  <>
                                <div className="row flex-lg-row justify-content-between">
                                  Decrypted message:
                                  <div className="col-8">
                                    <p style={{wordBreak: 'break-all'}} id="decryptedMessage">{this.state.decrypted}</p>
                                  </div>
                                </div>
                                <br />
                                <br />
                                <br />
                                <br />
                              </>)
                              :
                              ""
                            }
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="u2f" title="Password&shy;less auth">
                      <U2f />
                    </Tab>
                    <Tab eventKey="pwgen" title="Password generator">
                    <div className="container">
                      <div className="row">
                        <div className="col align-self-center offset-top">
                          {
                            [0,1,2,3,4,5].map((item, i) => {
                              return (
                                <span key={i}>
                                  <p>{(crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5) + 
                                    (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 5)
                                  }</p>
                                </span>)
                              })
                            }
                          </div>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
        <footer>
          <div className="container-fluid">
            <div className="row">
            <div className="col-12">
                  <small style={{color: '#a0a0a0'}} className="float-right">Crypto stands for cryptography.</small>
                </div>
            </div>
          </div>
        </footer>
      </>
    );
  }
}
