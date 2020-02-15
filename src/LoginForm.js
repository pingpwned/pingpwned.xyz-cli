import React from 'react';
import base64url from 'base64url';
import jwt from 'jsonwebtoken';

class LoginForm extends React.Component {
  constructor(){
    super()
    this.state = {
      data: [],
      username: '',
      attType: 'None',
      authType: '',
      registration: true,
      firstStep: true,
      registered: false,
      deviceRegistered: false,
      user: {},
    }
  }
  async componentDidMount() {
    //let { from } = this.props.location.state || { from: { pathname: "/dashboard" } };
    //this.setState({from})
    const token = localStorage.getItem('accessToken')
    if ( token ) {
      let username = jwt.decode(localStorage.getItem('accessToken')).username;
      const response = await fetch(`http://localhost:3001/users/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer '+localStorage.getItem('accessToken'),
        },
      });
      //Bearer
      const user = await response.json();
      if (user) {
        this.setState({user, registered: true, deviceRegistered: false,})
      }
    }
  }
  render() {
    let arr = []
    
    if (Object.keys(this.state.user).length > 0) {
      arr = this.state.user.PEMPublicKey.split(/\r?\n/)
    }
    
    return (
        <div className="container">
            <div className="row">
                <div className="col align-self-center offset-top">
                {this.state.deviceRegistered ?
                  <>
                    <h4 style={{margin: '25px 0 15px'}}>Now log in with your device.</h4>
                  </>
                  :
                  ""
                }
                  {this.state.registered ?
                  <>
                    <div className="row">
                      <div className="col align-self-center">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            <th scope="col">Privacy Enhanced Mail Certificate:</th>
                            <th scope="col">Created at</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row"><p>{ this.state.user._id }</p></th>
                            <td><p>{ this.state.user.username }</p></td>
                            <td>{
                                  arr.map((line, i) => {
                                    return <span key={i}>{ line }<br /></span>
                                  })
                                }
                            </td>
                            <td><p>{ this.state.user.createdAt }</p></td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                    </div>
                    <span><button type="submit" className="btn btn-secondary float-right" onClick={this.handleLogout}>Logout</button></span>
                  </>
                  :
                    this.state.registration ?
                    <>
                      <form onSubmit={this.handleSubmit} style={{maxWidth: '300px', margin: '0 auto'}}>
                         <div className="form-group">
                          <label htmlFor="exampleInputEmail1">Username</label>
                          <input type="text" name="email" className="form-control" id="exampleInputEmail1" 
                          aria-describedby="emailHelp" placeholder="Enter username"
                          value={this.state.username}
                          onChange={e => this.setState({ username: e.currentTarget.value })} />
                        </div>
                        {
                        this.state.firstStep ? 
                          (
                            <>
                            <div className="btn-toolbar flex-row justify-content-between" role="toolbar">
                              <div  className="btn-group" role="group">
                                <button onClick={(e) => this.handleFirstStep(e)} className="btn btn-outline-info float-left">Advanced</button>
                              </div>
                              <div  className="btn-group" role="group">
                                <button type="submit" className="btn btn-secondary float-right">Register</button>
                              </div>
                            </div>
                            </>
                          )
                          :
                          (
                            <>
                              <div className="form-group">
                                {/* <input type="text" name="firstName" className="form-control" id="exampleInputFirstName1" 
                                aria-describedby="emailHelp" placeholder="Enter first name"
                                value={this.state.firstName}
                                onChange={e => this.setState({ firstName: e.currentTarget.value })} /> */}
                                <label htmlFor="inputAttType">Attestation type</label>
                                <select id="inputAttType" className="custom-select custom-select mb-3">
                                  <option selected>None</option>
                                  <option value="2">Direct</option>
                                  <option value="1">Indirect</option>
                                </select>

                                <label htmlFor="inputAuthType">Authenticator type</label>
                                <select id="inputAttType" className="custom-select custom-select mb-3">
                                  <option selected>Unspecified</option>
                                  <option value="1">Crossplatform</option>
                                  <option value="2">Platform (TPM)</option>
                                </select>
                              </div>
                              <button onClick={(e) => this.handleFirstStep(e)} className="btn btn-outline-info float-left">Back</button>
                              <button type="submit" className="btn btn-secondary float-right">Register</button>
                              <br />
                              <br />
                            </>
                          )
                        }
                      </form>
                      <div className="col align-self-center" style={{maxWidth: '300px', margin: '0 auto'}}>
                        <small>Already registered?</small> <button className="btn btn-sm btn-link" 
                        onClick={() => this.setState({registration: false})}>&lt;- back to log in</button>
                     </div>
                    </>
                  :
                    <>
                      <form onSubmit={this.handleSubmit} style={{maxWidth: '300px', margin: '0 auto'}}>
                          <div className="form-group">
                              <label htmlFor="inputUsername">Username</label>
                              <input type="text" name="username" className="form-control" id="inputUsername" 
                              aria-describedby="emailHelp" placeholder="Enter username"
                              value={this.state.username}
                              onChange={e => this.setState({ username: e.currentTarget.value })} />
                          </div>
                          <button type="submit" className="btn btn-secondary">Submit</button>
                      </form>
                      <div className="col align-self-center" style={{maxWidth: '300px', margin: '0 auto'}}>
                        <small>Don't have an account?</small> <button className="btn btn-sm btn-link" 
                        onClick={() => this.setState({registration: true})}>Register now!</button>
                      </div>
                    
                    </>
                  }
                </div>
            </div>
          </div>
    );
  }

  handleSubmit = async e => {
    e.preventDefault();
    if (this.state.registration) {
      const response = await fetch('http://localhost:3001/users/registerDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: this.state.username, 
                               attType: this.state.attType, }),
      });
      //Bearer
      const body = await response.json();
      if (body) {
        // let options = {
        //     attType: 'direct',
        //     authType: 'cross-platform',
        //     userVerification: 'required',
        //     residentKeyRequirement: false,
        //     txAuthExtension: '',
        // }
        // call api to generate challenge with options
        //const res = await userApi.createCredential(this.props.data.user.data.id, options)
        let publicKey = {
            ...body.publicKey,
        }
        publicKey.challenge = this.bufferDecode(body.publicKey.challenge)
        publicKey.user.id = this.bufferDecode(body.publicKey.user.id)
        navigator.credentials.create({publicKey}).then((newCredential) => {
            this.setState({createResponse: newCredential, deviceRegistered: true, registration: false, });
            this.registerNewCredential(newCredential);
        }).catch(function (err) {
            console.info(err);
        });
      } else {
        if (body.msg) {
          console.error(body.msg)
        }
      }
  
    } else {
      const response = await fetch('http://localhost:3001/users/verifyDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: this.state.username, }),
      });
      //Bearer
      const res = await response.json();

      console.log(res, 'res')
            
      let publicKey = {
          ...res.publicKey,
          userVerification: 'discouraged',
      }
      publicKey.challenge = this.bufferDecode(res.publicKey.challenge)
      publicKey.allowCredentials[0].id = base64url.toBuffer(res.publicKey.allowCredentials[0].id)
      navigator.credentials.get({
          publicKey
      }).then(async (newCredential) => {
          const data = await this.attestationCeremony(newCredential)
          localStorage.setItem('accessToken', data.accessToken);
          this.setState({user: data.user, registered: true, deviceRegistered: false,})
      }).catch(function (err) {
          console.info(err);
      });
  
      // if(body.token) {
      //     localStorage.setItem('accessToken', body.token)
      //     this.setState({ redirectToReferrer: true });
      //     this.props.handleLoggedEvent()
      //     // Redirect
      // }
    }
  };

  handleFirstStep = (e) => {
    e.preventDefault()
    this.setState({firstStep: !this.state.firstStep})
  }
  handleLogout = e => {
    e.preventDefault()
    localStorage.clear()
    this.setState({user: {}, registered: false,})
  }

  bufferDecode = (value) => {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
  }

  // Encode an ArrayBuffer into a base64 string.
  bufferEncode = (value) => {
      var binary = '';
      var bytes = new Uint8Array( value );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return window.btoa( binary );
  }

  // createToken = async () => {
  //     let options = {
  //         attType: 'direct',
  //         authType: 'cross-platform',
  //         userVerification: 'required',
  //         residentKeyRequirement: false,
  //         txAuthExtension: '',
  //     }
  //     // call api to generate challenge with options
  //     try {
  //         const res = await userApi.createCredential(this.props.data.user.data.id, options)
  //         let publicKey = {
  //             ...res.publicKey,
  //         }
  //         publicKey.challenge = this.bufferDecode(res.publicKey.challenge)
  //         publicKey.user.id = this.bufferDecode(res.publicKey.user.id)
  //         navigator.credentials.create({publicKey}).then((newCredential) => {
  //             this.setState({createResponse: newCredential});
  //             this.registerNewCredential(newCredential);
  //         }).catch(function (err) {
  //             console.info(err);
  //         });
  //     } catch (err) {
  //         this.setState({apiError: err})
  //     }
  // }

  // removeDevice = async () => {
  //     // call api to generate challenge with options
  //     try {
  //         await userApi.removeDevice(this.props.data.user.data.id)
  //         this.setState({toggleRegisteredDeviceText: !this.state.toggleRegisteredDeviceText})
  //         this.props.alert.success('Device removed');
  //     } catch (err) {
  //         this.setState({apiError: err})
  //     }
  // }

  registerNewCredential = async (newCredential) => {
    let data = JSON.stringify({
      id: newCredential.id,
      rawId: this.bufferEncode(newCredential.rawId),
      type: newCredential.type,
      response: {
          attestationObject: this.bufferEncode(newCredential.response.attestationObject),
          clientDataJSON: this.bufferEncode(newCredential.response.clientDataJSON),
      },
      username: this.state.username,
    })
    try{
      await fetch('http://localhost:3001/users/saveDevice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    //Bearer
    //const body = await response.json();
    this.setState({ deviceRegistered: true })
    } catch (err) {
      console.log(err)
    }
  }

  attestationCeremony = async (newCredential) => {
      let data = JSON.stringify({
          id: newCredential.id,
          rawId: this.bufferEncode(newCredential.rawId),
          response: {
              authenticatorData: this.bufferEncode(newCredential.response.authenticatorData),
              clientDataJSON: this.bufferEncode(newCredential.response.clientDataJSON),
              signature: this.bufferEncode(newCredential.response.signature),
          },
          username: this.state.username,
      })
      try{
        const response = await fetch('http://localhost:3001/users/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
        });
      //Bearer
      const body = await response.json();
      return body
        //await userApi.verification(this.props.data.user.data.id, data)
      } catch (err) {
          console.log(err)
      }
  }
}

export default LoginForm;
