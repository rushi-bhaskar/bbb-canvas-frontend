import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const socket = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Adjust canvas size
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 50;

    // Connect to Socket.IO server
    socket.current = io("https://bbb-canvas-backend.onrender.com", {
      query: { token: "test-auth-token" },
    });

    // Initialize shapes
    socket.current.on("initialize_shapes", (serverShapes) => {
      setShapes(serverShapes);
    });

    // Listen for shape updates
    socket.current.on("set_shape_", (data) => {
      const { clientX, clientY, current_index_ } = data.data;
      setShapes((prevShapes) => {
        const updatedShapes = [...prevShapes];
        const shape = updatedShapes[current_index_];
        shape.x = clientX;
        shape.y = clientY;
        return updatedShapes;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Draw shapes on the canvas
  const drawShapes = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((shape) => {
      context.fillStyle = shape.color;
      context.fillRect(shape.x, shape.y, shape.width, shape.height);
    });
  };

  // Redraw shapes whenever they change
  useEffect(() => {
    drawShapes();
  }, [shapes]);

  // Check if mouse is inside a shape
  const isMouseInShape = (x, y, shape) => {
    return (
      x > shape.x &&
      x < shape.x + shape.width &&
      y > shape.y &&
      y < shape.y + shape.height
    );
  };

  // Handle mouse down
  const handleMouseDown = (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    shapes.forEach((shape, index) => {
      if (isMouseInShape(mouseX, mouseY, shape)) {
        setCurrentIndex(index);
        setIsDragging(true);
        setStartPos({ x: mouseX, y: mouseY });
      }
    });
  };

  // Handle mouse move
  const handleMouseMove = (event) => {
    if (!isDragging || currentIndex === null) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const dx = mouseX - startPos.x;
    const dy = mouseY - startPos.y;

    setShapes((prevShapes) => {
      const updatedShapes = [...prevShapes];
      const shape = updatedShapes[currentIndex];
      shape.x += dx;
      shape.y += dy;
      return updatedShapes;
    });

    socket.current.emit("set_shape_", {
      data: {
        clientX: mouseX,
        clientY: mouseY,
        current_index_: currentIndex,
      },
      function_name: "set_shape_",
    });

    setStartPos({ x: mouseX, y: mouseY });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setCurrentIndex(null);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "2px solid black" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    ></canvas>
  );
};

export default Canvas;
