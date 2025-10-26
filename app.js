// --- Авторизация ---
const tg = window.Telegram?.WebApp;
let currentUser = {
  id: tg?.initDataUnsafe?.user?.id || "guest",
  name: tg?.initDataUnsafe?.user?.first_name || "Гость",
  type: tg ? "telegram" : null
};

document.getElementById("username").innerText = currentUser.name;
document.getElementById("userId").innerText = currentUser.id;

// --- Вкладки ---
const profileTab = document.getElementById("profileTab");
const galleryTab = document.getElementById("galleryTab");
const profileSection = document.getElementById("profileSection");
const gallerySection = document.getElementById("gallerySection");
profileTab.onclick = () => { profileSection.style.display="block"; gallerySection.style.display="none"; }
galleryTab.onclick = () => { profileSection.style.display="none"; gallerySection.style.display="block"; }

// --- Данные постов ---
let posts = JSON.parse(localStorage.getItem("posts") || "[]");

// --- Рендер галереи ---
const galleryDiv = document.getElementById("gallery");
function renderGallery(filter={}) {
  galleryDiv.innerHTML = "";
  let filtered = posts;
  if(filter.author) filtered = filtered.filter(p => p.authorName.toLowerCase() === filter.author.toLowerCase());
  if(filter.tag) filtered = filtered.filter(p => p.tags.includes(filter.tag.startsWith("#") ? filter.tag : "#" + filter.tag));
  filtered.forEach((p, index)=>{
    const div = document.createElement("div");
    div.className="post";
    div.innerHTML = `
      <img src="${p.image}" alt="">
      <p>${p.desc}</p>
      <p>${p.tags.join(" ")}</p>
      <p>Автор: ${p.authorName}</p>
      ${currentUser.id === p.authorId ? `<button class="editBtn" data-index="${index}">Редактировать</button>` : ""}
    `;
    galleryDiv.appendChild(div);
  });

  // --- Обработка редактирования ---
  document.querySelectorAll(".editBtn").forEach(btn=>{
    btn.onclick = ()=>{
      const idx = btn.dataset.index;
      openModal(posts[idx], idx);
    }
  });
}
renderGallery();

// --- Фильтры ---
document.getElementById("applyFilter").onclick = ()=>{
  const author = document.getElementById("filterAuthor").value;
  const tag = document.getElementById("filterTag").value;
  renderGallery({
    author: author ? author : null,
    tag: tag ? tag : null
  });
}

// --- Модальное окно ---
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
document.getElementById("addPostBtn").onclick = ()=> openModal();
document.getElementById("closeModal").onclick = ()=> modal.style.display="none";

let editIndex = null;
function openModal(post=null, index=null) {
  modal.style.display="flex";
  if(post){
    modalTitle.innerText="Редактировать пост";
    document.getElementById("postDesc").value = post.desc;
    document.getElementById("postTags").value = post.tags.join(" ");
    editIndex = index;
  } else {
    modalTitle.innerText="Новый пост";
    document.getElementById("postDesc").value="";
    document.getElementById("postTags").value="";
    document.getElementById("postImage").value=null;
    editIndex = null;
  }
}

// --- Сохранение поста ---
document.getElementById("savePost").onclick = ()=>{
  const desc = document.getElementById("postDesc").value;
  const tags = document.getElementById("postTags").value.split(" ").filter(t=>t.startsWith("#"));
  const file = document.getElementById("postImage").files[0];

  if(!desc) return alert("Введите описание");
  if(tags.length===0) return alert("Введите хотя бы один тег с #");

  if(editIndex !== null){
    // редактируем пост
    posts[editIndex].desc = desc;
    posts[editIndex].tags = tags;
    if(file){
      const reader = new FileReader();
      reader.onload = ()=>{
        posts[editIndex].image = reader.result;
        localStorage.setItem("posts", JSON.stringify(posts));
        renderGallery();
        modal.style.display="none";
      }
      reader.readAsDataURL(file);
    } else {
      localStorage.setItem("posts", JSON.stringify(posts));
      renderGallery();
      modal.style.display="none";
    }
  } else {
    if(!file) return alert("Выберите изображение");
    const reader = new FileReader();
    reader.onload = ()=>{
      posts.push({
        authorId: currentUser.id,
        authorName: currentUser.name,
        desc,
        tags,
        image: reader.result,
        date: new Date()
      });
      localStorage.setItem("posts", JSON.stringify(posts));
      renderGallery();
      modal.style.display="none";
    }
    reader.readAsDataURL(file);
  }
}

// --- Админ: смена фона ---
const adminId = "YOUR_TELEGRAM_ID"; // только этот ID может менять фон
if(currentUser.id == adminId){
  const adminSection = document.getElementById("adminSection");
  const btn = document.createElement("button");
  btn.innerText = "Сменить фон";
  btn.onclick = ()=>{
    const url = prompt("Введите URL нового фона");
    if(url) document.body.style.backgroundImage = `url('${url}')`;
  }
  adminSection.appendChild(btn);
}
