import DataUriParser from "datauri/parser.js";
import path from "path";

// Define the type for the input file
interface File {
    originalname: string; // The name of the file
    buffer: Buffer;       // The file content in a binary buffer
}

// Define the getDataUri function with corrected types
const getDataUri = (file: File) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname); // Extract the file extension
    const result = parser.format(extName, file.buffer); // Get the Data URI object
    return result;
};

export default getDataUri;
