import React, { useState, useEffect } from "react"
import TitiTataLogo from '../config/image/tititata-logo1.png'

const EntranceModal = props => {
    useEffect(() => {
        const entraceModal = new window.bootstrap.Modal(document.getElementById("ttEntraceModal"), { backdrop: false })
        if (props.visible) entraceModal.show()
    }, [props.visible])

    const [name, setName] = useState("")

    return (
        <div className="d-flex justify-content-center bg-secondary" style={{ height: "100vh", padding: 0, /* backgroundColor: '#B0BEC5'*/ }}>
            <div className="modal" tabIndex="-1" id="ttEntraceModal" data-bs-keyboard="false" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{ width: 400}}>
                    <div className="modal-content py-3 border-0" style={{ /*backgroundImage: 'linear-gradient(#859398, #283048)'*/ backgroundImage: 'linear-gradient(#616C78,#29323c)'  }}>
                        <div className="modal-header d-flex flex-wrap pb-1" style={{ borderBottom: 0 }}>

                            <div className='col-12 text-center'>
                                <img src={TitiTataLogo} alt="tititata-logo" style={{ width: '130px' }} />
                            </div>

                        </div>
                        <div className="modal-body">
                            <input type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="form-control" placeholder="Enter your nick name"
                                style={{ outline: 0, borderWidth: '0 0 1px', borderColor: '#c5dec5', color: '#c5dec5', background: 'transparent', borderRadius: 0 }} />
                        </div>
                        <div className="modal-footer justify-content-center" style={{ borderTop: 0 }}>
                            <button type="button" className="login-btn btn bg-white px-4" style={{ borderRadius: '110px' }} onClick={e => props.onEnter(name)}>ENTER</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EntranceModal