const Loader1 = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-[#FDF5F5]">
            <div className="flex flex-col justify-center items-center">
                <div
                    className="w-10 h-10 border-4 border-t-4 border-[#FAE8E8] border-solid rounded-full animate-spin"
                    style={{ borderTopColor: "#D64545" }}
                ></div>
                <span className="mt-4 text-lg font-medium text-[#2D3436]">
                    Dr. NIDHI is analyzing...
                </span>
            </div>
        </div>
    );
}

export default Loader1