// import CanVas from "./views/canvas";

// function App() {
//   return (
//     <>
//       <CanVas>
        
//       </CanVas>
//     </>
//   );
// }

// export default App;

import React from "react";
import Canvas from "./components/canvas.js";

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>Real-Time Drag-and-Drop Shapes</h1>
      <Canvas />
    </div>
  );
}

export default App;

