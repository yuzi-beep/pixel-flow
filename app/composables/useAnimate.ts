export const useAnimate = (canvasRef: Ref<HTMLCanvasElement | null>, isDark: Ref<boolean>) => {
  let animationId: number | null = null;

  // 3D Math helpers
  const rotateX = (y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { y: y * cos - z * sin, z: z * cos + y * sin };
  };

  const rotateY = (x: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos + z * sin, z: z * cos - x * sin };
  };

  const rotateZ = (x: number, y: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: y * cos + x * sin };
  };

  type ShapeType =
    | "tetrahedron"
    | "cube"
    | "octahedron"
    | "pyramid"
    | "prism"
    | "pixel";

  interface Shape {
    type: ShapeType;
    x: number;
    y: number;
    z: number;
    size: number;
    rx: number;
    ry: number;
    rz: number;
    vrx: number;
    vry: number;
    vrz: number;
    vx: number;
    vy: number;
    vz: number;
    colorIndex?: number;
  }

  const initCanvas = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width) * 2 - 1;
      targetMouseY = (e.clientY / height) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const shapes: Shape[] = [];
    const numShapes = 25;
    const numPixels = 150;
    const spread = 4000;

    for (let i = 0; i < numShapes; i++) {
      const rand = Math.random();
      const type =
        rand > 0.8
          ? "tetrahedron"
          : rand > 0.6
          ? "cube"
          : rand > 0.4
          ? "octahedron"
          : rand > 0.2
          ? "pyramid"
          : "prism";
      shapes.push({
        type,
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        size: 20 + Math.random() * 100,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        vrx: (Math.random() - 0.5) * 0.02,
        vry: (Math.random() - 0.5) * 0.02,
        vrz: (Math.random() - 0.5) * 0.02,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
      });
    }

    for (let i = 0; i < numPixels; i++) {
      shapes.push({
        type: "pixel",
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        size: 2 + Math.random() * 5,
        rx: 0,
        ry: 0,
        rz: 0,
        vrx: 0,
        vry: 0,
        vrz: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        colorIndex: Math.floor(Math.random() * 5),
      });
    }

    const getColors = (isDark: boolean) => {
      if (isDark) {
        return ["#FF0055", "#00FFaa", "#00ccFF", "#FFaa00", "#aa00FF"];
      } else {
        return ["#FF3366", "#00bbaa", "#0099FF", "#FF9900", "#9900FF"];
      }
    };

    const animate = () => {
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const palette = getColors(isDark.value);
      const renderList: { z: number; draw: () => void }[] = [];

      shapes.forEach((shape) => {
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.z += shape.vz;

        shape.rx += shape.vrx;
        shape.ry += shape.vry;
        shape.rz += shape.vrz;

        const limit = spread / 1.5;
        if (shape.x > limit) shape.x = -limit;
        if (shape.x < -limit) shape.x = limit;
        if (shape.y > limit) shape.y = -limit;
        if (shape.y < -limit) shape.y = limit;
        if (shape.z > limit) shape.z = -limit;
        if (shape.z < -limit) shape.z = limit;

        let px = shape.x;
        let py = shape.y;
        let pz = shape.z;

        const rotY = rotateY(px, pz, mouseX * 1.5);
        px = rotY.x;
        pz = rotY.z;

        const rotX = rotateX(py, pz, -mouseY * 1.5);
        py = rotX.y;
        pz = rotX.z;

        const fov = 800;
        const scale = fov / (fov + pz + 1000);

        if (scale < 0) return;

        const screenX = width / 2 + px * scale;
        const screenY = height / 2 + py * scale;

        renderList.push({
          z: pz,
          draw: () => {
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.scale(scale, scale);

            if (shape.type === "tetrahedron") {
              const s = shape.size;
              const vertices = [
                { x: s, y: s, z: s },
                { x: -s, y: -s, z: s },
                { x: -s, y: s, z: -s },
                { x: s, y: -s, z: -s },
              ];

              const rotatedVerts = vertices.map((v) => {
                let { x, y } = rotateZ(v.x, v.y, shape.rz);
                let z = v.z;
                ({ y, z } = rotateX(y, z, shape.rx));
                ({ x, z } = rotateY(x, z, shape.ry));
                return { x, y, z };
              });

              const faces = [
                [0, 1, 2],
                [0, 2, 3],
                [0, 3, 1],
                [1, 3, 2],
              ];

              const faceList = faces
                .map((indices, i) => {
                  const v0 = rotatedVerts[indices[0]!]!;
                  const v1 = rotatedVerts[indices[1]!]!;
                  const v2 = rotatedVerts[indices[2]!]!;
                  const z = (v0.z + v1.z + v2.z) / 3;
                  return {
                    indices,
                    z,
                    color: palette[i % palette.length] || "#fff",
                  };
                })
                .sort((a, b) => b.z - a.z);

              faceList.forEach((face) => {
                const v0 = rotatedVerts[face.indices[0]!]!;
                const v1 = rotatedVerts[face.indices[1]!]!;
                const v2 = rotatedVerts[face.indices[2]!]!;

                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.closePath();
                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = isDark.value
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)";
                ctx.stroke();
              });
            } else if (shape.type === "cube") {
              const s = shape.size * 0.7;
              const vertices = [
                { x: -s, y: -s, z: -s },
                { x: s, y: -s, z: -s },
                { x: s, y: s, z: -s },
                { x: -s, y: s, z: -s },
                { x: -s, y: -s, z: s },
                { x: s, y: -s, z: s },
                { x: s, y: s, z: s },
                { x: -s, y: s, z: s },
              ];

              const rotatedVerts = vertices.map((v) => {
                let { x, y } = rotateZ(v.x, v.y, shape.rz);
                let z = v.z;
                ({ y, z } = rotateX(y, z, shape.rx));
                ({ x, z } = rotateY(x, z, shape.ry));
                return { x, y, z };
              });

              const faces = [
                [0, 1, 2, 3],
                [4, 5, 6, 7],
                [0, 1, 5, 4],
                [2, 3, 7, 6],
                [0, 3, 7, 4],
                [1, 2, 6, 5],
              ];

              const faceList = faces
                .map((indices, i) => {
                  const z =
                    indices.reduce(
                      (acc, idx) => acc + (rotatedVerts[idx]?.z || 0),
                      0
                    ) / 4;
                  return {
                    indices,
                    z,
                    color: palette[i % palette.length] || "#fff",
                  };
                })
                .sort((a, b) => b.z - a.z);

              faceList.forEach((face) => {
                const v0 = rotatedVerts[face.indices[0]!]!;
                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                for (let k = 1; k < 4; k++) {
                  const vk = rotatedVerts[face.indices[k]!]!;
                  ctx.lineTo(vk.x, vk.y);
                }
                ctx.closePath();
                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = isDark.value
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)";
                ctx.stroke();
              });
            } else if (shape.type === "octahedron") {
              const s = shape.size * 0.8;
              const vertices = [
                { x: 0, y: s, z: 0 }, // top
                { x: s, y: 0, z: 0 }, // right
                { x: 0, y: 0, z: s }, // front
                { x: -s, y: 0, z: 0 }, // left
                { x: 0, y: 0, z: -s }, // back
                { x: 0, y: -s, z: 0 }, // bottom
              ];

              const rotatedVerts = vertices.map((v) => {
                let { x, y } = rotateZ(v.x, v.y, shape.rz);
                let z = v.z;
                ({ y, z } = rotateX(y, z, shape.rx));
                ({ x, z } = rotateY(x, z, shape.ry));
                return { x, y, z };
              });

              const faces = [
                [0, 1, 2],
                [0, 2, 3],
                [0, 3, 4],
                [0, 4, 1],
                [5, 2, 1],
                [5, 3, 2],
                [5, 4, 3],
                [5, 1, 4],
              ];

              const faceList = faces
                .map((indices, i) => {
                  const v0 = rotatedVerts[indices[0]!]!;
                  const v1 = rotatedVerts[indices[1]!]!;
                  const v2 = rotatedVerts[indices[2]!]!;
                  const z = (v0.z + v1.z + v2.z) / 3;
                  return {
                    indices,
                    z,
                    color: palette[i % palette.length] || "#fff",
                  };
                })
                .sort((a, b) => b.z - a.z);

              faceList.forEach((face) => {
                const v0 = rotatedVerts[face.indices[0]!]!;
                const v1 = rotatedVerts[face.indices[1]!]!;
                const v2 = rotatedVerts[face.indices[2]!]!;

                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.closePath();
                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = isDark.value
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)";
                ctx.stroke();
              });
            } else if (shape.type === "pyramid") {
              const s = shape.size;
              const h = shape.size * 1.2;
              const vertices = [
                { x: 0, y: -h / 2, z: 0 }, // top
                { x: -s, y: h / 2, z: -s }, // base FL
                { x: s, y: h / 2, z: -s }, // base FR
                { x: s, y: h / 2, z: s }, // base BR
                { x: -s, y: h / 2, z: s }, // base BL
              ];

              const rotatedVerts = vertices.map((v) => {
                let { x, y } = rotateZ(v.x, v.y, shape.rz);
                let z = v.z;
                ({ y, z } = rotateX(y, z, shape.rx));
                ({ x, z } = rotateY(x, z, shape.ry));
                return { x, y, z };
              });

              const faces = [
                [0, 1, 2], // front
                [0, 2, 3], // right
                [0, 3, 4], // back
                [0, 4, 1], // left
                [1, 4, 3, 2], // bottom
              ];

              const faceList = faces
                .map((indices, i) => {
                  const z =
                    indices.reduce(
                      (acc, idx) => acc + (rotatedVerts[idx]?.z || 0),
                      0
                    ) / indices.length;
                  return {
                    indices,
                    z,
                    color: palette[i % palette.length] || "#fff",
                  };
                })
                .sort((a, b) => b.z - a.z);

              faceList.forEach((face) => {
                const v0 = rotatedVerts[face.indices[0]!]!;
                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                for (let k = 1; k < face.indices.length; k++) {
                  const vk = rotatedVerts[face.indices[k]!]!;
                  ctx.lineTo(vk.x, vk.y);
                }
                ctx.closePath();
                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = isDark.value
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)";
                ctx.stroke();
              });
            } else if (shape.type === "prism") {
              const s = shape.size * 0.6;
              const h = shape.size * 1.2;
              const vertices = [
                // Top triangle
                { x: 0, y: -h / 2, z: -s },
                { x: s, y: -h / 2, z: s },
                { x: -s, y: -h / 2, z: s },
                // Bottom triangle
                { x: 0, y: h / 2, z: -s },
                { x: s, y: h / 2, z: s },
                { x: -s, y: h / 2, z: s },
              ];

              const rotatedVerts = vertices.map((v) => {
                let { x, y } = rotateZ(v.x, v.y, shape.rz);
                let z = v.z;
                ({ y, z } = rotateX(y, z, shape.rx));
                ({ x, z } = rotateY(x, z, shape.ry));
                return { x, y, z };
              });

              const faces = [
                [0, 1, 2], // top
                [3, 5, 4], // bottom
                [0, 2, 5, 3], // left side
                [1, 0, 3, 4], // right side
                [2, 1, 4, 5], // front side
              ];

              const faceList = faces
                .map((indices, i) => {
                  const z =
                    indices.reduce(
                      (acc, idx) => acc + (rotatedVerts[idx]?.z || 0),
                      0
                    ) / indices.length;
                  return {
                    indices,
                    z,
                    color: palette[i % palette.length] || "#fff",
                  };
                })
                .sort((a, b) => b.z - a.z);

              faceList.forEach((face) => {
                const v0 = rotatedVerts[face.indices[0]!]!;
                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                for (let k = 1; k < face.indices.length; k++) {
                  const vk = rotatedVerts[face.indices[k]!]!;
                  ctx.lineTo(vk.x, vk.y);
                }
                ctx.closePath();
                ctx.fillStyle = face.color;
                ctx.fill();
                ctx.strokeStyle = isDark.value
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)";
                ctx.stroke();
              });
            } else if (shape.type === "pixel") {
              ctx.fillStyle = palette[shape.colorIndex || 0] || "#fff";
              ctx.beginPath();
              ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
              ctx.fill();
            }

            ctx.restore();
          },
        });
      });

      renderList.sort((a, b) => b.z - a.z);
      renderList.forEach((item) => item.draw());

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
    };
  };

  return {
    initCanvas,
  };
};
