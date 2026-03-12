export function handleSessionExpired() {
  // Clear storage
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("user");
  localStorage.removeItem("departments");
  localStorage.removeItem("dept_ids");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("student_id");

  // Clear cookies
  document.cookie = "access=; path=/; max-age=0";
  document.cookie = "refresh=; path=/; max-age=0";
  document.cookie = "roleKey=; path=/; max-age=0";
  document.cookie = "user_type=; path=/; max-age=0";

  // Overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.45)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";
  overlay.style.padding = "20px";

  // Card
  const card = document.createElement("div");
  card.style.background = "#ffffff";
  card.style.borderRadius = "16px";
  card.style.padding = "32px 28px";
  card.style.maxWidth = "420px";
  card.style.width = "100%";
  card.style.textAlign = "center";
  card.style.boxShadow = "0 20px 60px rgba(0,0,0,0.25)";
  card.style.animation = "sessionPop 0.35s ease";
  card.style.fontFamily = "inherit";

  // Icon
  const icon = document.createElement("div");
  icon.innerHTML = "⚠️";
  icon.style.fontSize = "42px";
  icon.style.marginBottom = "14px";

  // Title
  const title = document.createElement("h3");
  title.innerText = "انتهت صلاحية الجلسة";
  title.style.margin = "0 0 10px 0";
  title.style.color = "#2C3A5F";
  title.style.fontSize = "22px";

  // Message
  const message = document.createElement("p");
  message.innerText = "يرجى تسجيل الدخول مرة أخرى للمتابعة.";
  message.style.margin = "0";
  message.style.color = "#6B7280";
  message.style.fontSize = "16px";

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(message);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Animation
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes sessionPop {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Redirect
  setTimeout(() => {
    window.location.href = "/";
  }, 3000);
}