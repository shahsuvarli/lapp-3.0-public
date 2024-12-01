import { useState } from "react";
import messages from "../../constants/messages.json";
import { exportExcelFile } from "utils/excelExport";

function Marketing({ setMarketing, quote, materials, session }) {
  const [selectedMessages, setSelectedMessages] = useState([]);
  const toggleMessages = (id) => {
    const newMessages = messages.find((item) => item.id !== id);
    setSelectedMessages([...newMessages.messages]);
  };
  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen bg-[#4845458f] flex justify-center items-center z-[100]"
      onClick={() => setMarketing(false)}
    >
      <div
        className="bg-white w-2/3 rounded-md animate-[rise_1s_ease-in-out] p-5 gap-4 flex flex-col h-5/6"
        onClick={(e) => e.stopPropagation()}
      >
        <p>Marketing</p>
        <div className="w-full z-10 flex flex-col py-2 box-border overflow-y-scroll border border-solid border-[#939292] hover:cursor-pointer rounded-md gap-2 h-[80%]">
          {messages.map(({ id, messages, label }) => (
            <fieldset
              key={id}
              className="flex flex-row items-center gap-2 hover:bg-[#e9bd9b] w-full px-2 min-h-10 ease-in-out duration-300"
            >
              <input
                readOnly
                type="radio"
                className="hover:cursor-pointer"
                onClick={() => toggleMessages(id)}
                id={`input-${id}`}
                name="marketing"
              />
              <label
                className="w-full hover:cursor-pointer min-h-10 items-center block"
                htmlFor={`input-${id}`}
              >
                <div className="flex flex-col pl-10 gap-2 border border-1 border-[#47454576] rounded py-3">
                  <p>{label}:</p>
                  {messages.map(({ id, message }) => {
                    const messageValue = message.replace(
                      /{copper-rate}/g,
                      quote.copper_rate
                    );
                    return (
                      <span key={id} className="pl-5 text-sm">
                        -&nbsp;{messageValue}
                      </span>
                    );
                  })}
                </div>
              </label>
            </fieldset>
          ))}
        </div>
        <div className="justify-end flex flex-row">
          <button
            disabled={!selectedMessages.length}
            className="bg-[#e7914e] m-4 px-4 py-2 rounded-md text-white"
            onClick={() =>
              exportExcelFile(quote, materials, session, selectedMessages)
            }
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default Marketing;
