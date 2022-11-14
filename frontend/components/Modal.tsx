import React from "react";

export default function Modal({
  showModal,
  setShowModal,
  title,
  body,
  footer,
}) {
  return (
    <div
      className={`modal fade fixed top-0 left-0 w-full h-full outline-none overflow-x-hidden overflow-y-auto bg-gray-200 bg-opacity-50${
        showModal ? "" : " hidden"
      }`}
      aria-hidden={showModal}
    >
      <div className="modal-dialog relative w-1/2 top-1/4 m-auto pointer-events-none">
        <div className="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
          <div className="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
            {title}

            <button
              type="button"
              className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
          </div>

          <div className="modal-body relative p-4">{body}</div>

          <div className="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
