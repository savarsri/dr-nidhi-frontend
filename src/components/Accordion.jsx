export default function Accordion(props) {
    return (
        <div className="border rounded-lg mb-1">
            <button
                className="w-full p-4 text-left bg-primary rounded-lg hover:bg-primary-light transition duration-300 text-white font-bold text-xl"
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
                <div className="p-4 bg-gray-100 text-text-dark">
                    {props.data}
                </div>
            )}
        </div>
    );
}; 