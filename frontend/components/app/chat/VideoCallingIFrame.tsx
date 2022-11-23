export default function VideoCalling() {
  return (
    <iframe
      src="http://127.0.0.1:5173/"
      className=" min-w-full"
      allow="autoplay; camera; microphone"
      style={{ height: "calc(100vh - 100px)" }}
    ></iframe>
  );
}
