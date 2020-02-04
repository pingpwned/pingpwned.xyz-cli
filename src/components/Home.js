import React from 'react';

class Home extends React.Component {
    render() {
        return (
            <>
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
                                        <button style={{marginTop: '50px'}} onClick={this.handleKeyGenSign}>Generate key pair</button>
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
                                    </div>
                                    </div>
                                </div>  
                                </Tab>
                                <Tab eventKey="rsa" title="Message encryption">
                                <div className="row justify-content-md-center">
                                    <div className="col-md-auto col-md-6">
                                    <div>
                                        <button style={{marginTop: '50px'}} onClick={this.handleKeyGenVerify}>Generate key pair</button>
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
                                        <button onClick={this.encryptMessage}>Encrypt message</button>
                                        </div>
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
                                    </div>
                                </div>
                                </Tab>
                                <Tab eventKey="u2f" title="Passwordless authentication">
                                <U2f />
                                </Tab>
                                <Tab eventKey="pwgen" title="Password generator"></Tab>
                            </Tabs>
                            </div>
                        </div>
                    </div>
                </main>
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
        )
    }
}