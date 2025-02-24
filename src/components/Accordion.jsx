export default function Accordion(props) {
    return (
        <div className="border rounded-md mb-1">
            <button
                className="w-full p-4 text-left bg-[#FAE8E8] hover:bg-[#C98484] transition duration-300"
                onClick={props.toggleAccordion}
            >
                {props.title}
                <span className={`float-right transform ${props.isOpen ?
                    'rotate-180' : 'rotate-0'}  
                                 transition-transform duration-300`}>
                    &#9660;
                </span>
            </button>
            {props.isOpen && (
                <div className="p-4 bg-white">
                    {props.data}
                </div>
            )}
        </div>
    );
}; 