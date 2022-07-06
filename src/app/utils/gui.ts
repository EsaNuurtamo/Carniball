export const createText = (size: number) => {
  const text2 = document.createElement("div");
  text2.style.position = "absolute";
  text2.style.textAlign = "center";
  text2.style.paddingTop = "18px"
  text2.style.zIndex = "2";
  text2.style.width = "100px";
  text2.style.height = "50px";
  text2.style.color = "black";
  text2.style.left = "10px";
  text2.style.top = "20px";
  text2.style.backgroundColor = "white";
  text2.style.fontFamily = "'Roboto', sans-serif";
  text2.innerHTML = `Score: <br> ${Math.round(size * 100) / 100}`;
  document.body.appendChild(text2);
};
