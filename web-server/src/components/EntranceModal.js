import React, { useState, useEffect } from "react"

const EntranceModal = props => {
    useEffect(() => {
        const entraceModal = new window.bootstrap.Modal(document.getElementById("ttEntraceModal"), { backdrop: false })
        if(props.visible) entraceModal.show()
    }, [props.visible])

    const [name, setName] = useState("")

    return (
        <div className="modal" tabIndex="-1" id="ttEntraceModal" data-bs-keyboard="false" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content" style={{ backgroundColor: "#eeeeee" }}>
                    <div className="modal-header">
                        <h5 className="modal-title">Please enter your nick name</h5>
                    </div>
                    <div className="modal-body">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-control" placeholder="Enter your nick name" />
                    </div>
                    <div className="modal-footer justify-content-center">
                        <button type="button" className="btn btn-primary px-4" onClick={e => props.onEnter(name)}>ENTER</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EntranceModal