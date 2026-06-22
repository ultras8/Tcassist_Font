import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const CoordinateAdjusterPage = ({ year, subjectName, subjectId, initialPage = 1 }) => {
  const [page, setPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState(initialPage);
  const [coords, setCoords] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // เก็บเป็น Index ของอาร์เรย์ coords
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [hasImage, setHasImage] = useState(true);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });
  const imgRef = useRef(null);

  const getImageUrl = (id, pageNum) => {
    const token = localStorage.getItem("token");
    return `http://localhost:3000/exams/image/${id}/${pageNum}?token=${token}`;
  };

  // ดึงจำนวนหน้าทั้งหมด
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/exams/total-pages`, {
          params: { subjectName, year },
        });
        setTotalPages(res.data.total || 1);
      } catch (err) {
        setTotalPages(50);
      }
    };
    if (year && subjectName) fetchTotalPages();
  }, [subjectName, year]);

  // โหลดข้อมูลพิกัด
  const fetchCurrentPageData = async () => {
    if (!subjectId) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/exams/questions/${subjectId}/${page}`
      );
      if (response.data && response.data.length > 0) {
        const sortedData = response.data.sort(
          (a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber)
        );
        setCoords(sortedData);
      } else {
        setCoords([]);
      }
      setSelectedId(null);
    } catch (err) {
      console.error("โหลดข้อมูลไม่สำเร็จ", err);
      setCoords([]);
    }
  };

  useEffect(() => {
    fetchCurrentPageData();
    setInputPage(page);
    setHasImage(true);
  }, [subjectId, page]);

  // เพิ่มพิกัดใหม่
  const handleAddNew = async () => {
    let nextNum = 1;
    if (coords.length > 0) {
      nextNum = Math.max(...coords.map((c) => parseInt(c.questionNumber) || 0)) + 1;
    } else if (page > 1) {
      try {
        const prevPage = page - 1;
        const res = await axios.get(
          `http://localhost:3000/exams/questions/${subjectId}/${prevPage}`
        );
        if (res.data && res.data.length > 0) {
          const lastNums = res.data.map((q) => parseInt(q.questionNumber) || 0);
          nextNum = Math.max(...lastNums) + 1;
        }
      } catch (err) {
        nextNum = 1;
      }
    }

    const newBox = {
      id: `temp-${Date.now()}`,
      examId: Number(subjectId),
      year: String(year),
      subjectName: String(subjectName),
      pageNumber: page,
      questionNumber: nextNum.toString(),
      x: 100,
      y: 100,
      width: 400,
      height: 150,
      correctAnswer: "",
    };
    const newCoords = [...coords, newBox];
    setCoords(newCoords);
    setSelectedId(newCoords.length - 1);
  };

  // บันทึกข้อมูล
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        coords.map((item) => {
          const payload = {
            examId: Number(subjectId),
            year: String(year),
            subjectName: String(subjectName),
            pageNumber: Number(page),

            questionNumber: String(item.questionNumber),

            x: Math.round(item.x),
            y: Math.round(item.y),
            width: Math.round(item.width),
            height: Math.round(item.height),

            // เพิ่ม
            imageWidth: imageSize.width,
            imageHeight: imageSize.height,

            correctAnswer: item.correctAnswer || ""
          };

          if (item.id.toString().startsWith("temp-")) {
            return axios.post(`http://localhost:3000/exams/questions`, payload);
          } else {
            return axios.patch(`http://localhost:3000/exams/questions/${item.id}`, payload);
          }
        })
      );
      alert(`บันทึกข้อมูลหน้า ${page} สำเร็จแล้วค่ะ ✨`);
      await fetchCurrentPageData();
    } catch (err) {
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseDown = (e, index, type = "drag") => {
    e.stopPropagation();
    setSelectedId(index);

    if (!imgRef.current || !coords[index]) return;

    const rect = imgRef.current.getBoundingClientRect();
    const scale = imageSize.width / imgRef.current.offsetWidth;
    const currentMouseX = (e.clientX - rect.left) * scale;
    const currentMouseY = (e.clientY - rect.top) * scale;

    // บันทึกค่าเริ่มต้นไว้เปรียบเทียบตอนขยับเมาส์
    dragStartRef.current = {
      mouseX: currentMouseX,
      mouseY: currentMouseY,
      boxX: coords[index].x || 0,
      boxY: coords[index].y || 0,
      boxW: coords[index].width || 400,
      boxH: coords[index].height || 150,
    };

    if (type === "resize") setIsResizing(true);
    else setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if ((!isDragging && !isResizing) || selectedId === null || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const scale = imageSize.width / imgRef.current.offsetWidth;
    const mouseX = (e.clientX - rect.left) * scale;
    const mouseY = (e.clientY - rect.top) * scale;

    const updated = [...coords];
    const start = dragStartRef.current;

    if (isResizing) {
      const deltaX = mouseX - start.mouseX;
      const deltaY = mouseY - start.mouseY;
      updated[selectedId] = {
        ...updated[selectedId],
        width: Math.max(50, start.boxW + deltaX),
        height: Math.max(30, start.boxH + deltaY),
      };
    } else if (isDragging) {
      const deltaX = mouseX - start.mouseX;
      const deltaY = mouseY - start.mouseY;
      updated[selectedId] = {
        ...updated[selectedId],
        x: Math.max(0, start.boxX + deltaX),
        y: Math.max(0, start.boxY + deltaY),
      };
    }
    setCoords(updated);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleReorder = () => {
    if (coords.length === 0) return;
    const sortedByPosition = [...coords].sort((a, b) => a.y - b.y);
    setCoords(sortedByPosition);
  };

  return (
    <div className="flex h-[850px] w-full bg-slate-900 text-white overflow-hidden rounded-[3rem] border border-slate-700 shadow-2xl">
      {/* Sidebar Console */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-blue-400 italic text-center mb-6">Tuner Console</h2>

        <div className="bg-slate-900/50 p-3 rounded-2xl mb-4 border border-slate-700 flex items-center space-x-2">
          <button
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              setInputPage(prev);
            }}
            className="p-2 hover:text-blue-400 transition-colors"
          >
            ◀
          </button>
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(parseInt(inputPage) || 1)}
            className="w-full bg-transparent text-center font-bold text-sm focus:outline-none"
          />
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              setInputPage(next);
            }}
            className="p-2 hover:text-blue-400 transition-colors"
          >
            ▶
          </button>
        </div>

        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs text-slate-400 font-medium">รายการพิกัด ({coords.length})</span>
          {coords.length > 0 && (
            <button
              onClick={handleReorder}
              className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-400/10 px-2 py-1 rounded-lg transition-all"
            >
              🪄 เรียงลำดับ Y
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {coords.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(index)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedId === index
                ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-slate-700/30 border-slate-600"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={item.questionNumber}
                  onChange={(e) => {
                    const newCoords = [...coords];
                    newCoords[index].questionNumber = e.target.value;
                    setCoords(newCoords);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-blue-300 font-bold text-center outline-none focus:border-blue-400"
                />
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("ลบข้อนี้ใช่ไหมคะ?")) {
                      if (!item.id.toString().startsWith("temp-")) {
                        await axios.delete(`http://localhost:3000/exams/questions/${item.id}`);
                      }
                      setCoords(coords.filter((_, i) => i !== index));
                      setSelectedId(null);
                    }
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors text-lg"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 italic">
                  X: {Math.round(item.x)}, Y: {Math.round(item.y)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleAddNew}
            className="w-full bg-emerald-600 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all"
          >
            เพิ่มพิกัดใหม่
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full bg-blue-600 py-4 rounded-xl font-black hover:bg-blue-500 shadow-lg transition-all"
          >
            {isSaving ? "💾 กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>

      {/* Workspace Area */}
      <div
        className="flex-1 bg-[#0f172a] overflow-auto p-10 flex justify-center items-start relative select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative shadow-2xl border border-slate-700 bg-white">
          {hasImage ? (
            <img
              ref={imgRef}
              src={getImageUrl(subjectId, page)}
              key={getImageUrl(subjectId, page)}
              onLoad={(e) => {
                setImageSize({
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight,
                });
                setHasImage(true);
              }}
              onError={() => {
                setHasImage(false);
                setImageSize({ width: 0, height: 0 });
              }}
              className="max-w-[850px] display-block shadow-lg border border-slate-700"
            />
          ) : (
            <div className="text-center p-10 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-600 m-10">
              <div className="text-6xl mb-4">📄❌</div>
              <h3 className="text-2xl font-bold text-slate-300 mb-2">ไม่พบไฟล์ภาพข้อสอบค่ะ</h3>
              <button
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  setInputPage(prev);
                  setHasImage(true);
                }}
                className="mt-6 bg-slate-700 hover:bg-slate-600 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                ◀ กลับไปหน้า {Math.max(1, page - 1)}
              </button>
            </div>
          )}

          {/* Render Boxes */}
          {hasImage && imageSize.width > 0 && imgRef.current &&
            coords.map((item, index) => {
              const scale = imgRef.current.offsetWidth / imageSize.width;
              const isSelected = selectedId === index;
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleMouseDown(e, index, "drag")}
                  style={{
                    position: "absolute",
                    left: (item.x || 0) * scale,
                    top: (item.y || 0) * scale,
                    width: (item.width || 400) * scale,
                    height: (item.height || 150) * scale,
                    border: isSelected ? "3px solid #60a5fa" : "1px solid rgba(239, 68, 68, 0.6)",
                    backgroundColor: isSelected ? "rgba(96, 165, 250, 0.15)" : "rgba(239, 68, 68, 0.02)", // ลดความทึบลงหน่อยจะได้เห็นตัวอักษรข้างหลังชัดๆ ค่ะ
                    zIndex: isSelected ? 100 : 10,
                  }}
                >
                  <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-black ${isSelected ? "bg-blue-500" : "bg-red-500"} text-white rounded-br-md shadow-sm`}>
                    Q{item.questionNumber}
                  </div>

                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleMouseDown(e, index, "resize")}
                      className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 cursor-nwse-resize rounded-tl-sm shadow-md"
                    />
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default CoordinateAdjusterPage;