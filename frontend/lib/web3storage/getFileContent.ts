function getFileContent(
  file: File,
  method: "readAsText" | "readAsDataURL" = "readAsText"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;

    if (method === "readAsText") {
      reader.readAsText(file);
    } else if (method === "readAsDataURL") {
      reader.readAsDataURL(file);
    }
  });
}

export default getFileContent;
