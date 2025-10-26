// --- Авторизация ---
const tg = window.Telegram?.WebApp;
const ADMIN_ID = "ТВОЙ_TELEGRAM_ID"; // только этот ID может менять фон

let currentUser = {
  name: tg?.initDataUnsafe?.user?.first_name || "Гость",
  avatar: tg?.initDataUnsafe?.user?.photo_url || "default-avatar.png",
  type: tg ? "telegram" : null,
  id: tg?.initDataUnsafe?.user?.id || "guest"
};

document.getElementById("username").innerText = currentUser.name;
document.getElementById("userId").innerText = currentUser.name;
document.getElementById("userAvatar").src = currentUser.avatar;

// --- Google Sign-In ---
function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  currentUser.name = data.name;
  currentUser.avatar = data.picture || "default-avatar.png";
  currentUser.type = "google";
  currentUser.id = data.sub;
  document.getElementById("username").innerText = currentUser.name;
  document.getElementById("userId").innerText = currentUser.name;
  document.getElementById("userAvatar").src = currentUser.avatar;
}

google.accounts.id.initialize({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  callback: handleCredentialResponse
});
google.accounts.id.renderButton(
  document.getElementById("gSignIn"),
  { theme: "outline", size: "large" }
);

// --- Вкладки ---
const profileTab = document.getElementById("profileTab");
const galleryTab = document.getElementById("galleryTab");
const profileSection = document.getElementById("profileSection");
const gallerySection = document.getElementById("gallerySection");

function activateTab(tab){
  if(tab === "profile"){
    profileSection.style.display="block";
    gallerySection.style.display="none";
    profileTab.classList.add("active");
    galleryTab.classList.remove("active");
  } else {
    profileSection.style.display="none";
    gallerySection.style.display="block";
    galleryTab.classList.add("active");
    profileTab.classList.remove("active");
  }
}

profileTab.onclick = ()=>activateTab("profile");
galleryTab.onclick = ()=>activateTab("gallery");

// --- Посты ---
let posts = JSON.parse(localStorage.getItem("posts") || "[]");

// --- Рендер галереи ---
const galleryDiv = document.getElementById("gallery");
function renderGallery(filter={}){
  galleryDiv.innerHTML = "";
  let filtered = posts;
  if(filter.author) filtered = filtered.filter(p=>p.authorName.toLowerCase()===filter.author.toLowerCase());
  if(filter.tag) filtered = filtered.filter(p=>p.tags.includes(filter.tag.startsWith("#") ? filter.tag : "#" + filter.tag));

  filtered.forEach((p,index)=>{
    const div = document.createElement("div");
    div.className="post";
    div.innerHTML = `
      <img src="${p.image}" alt="">
      <p>${p.desc}</p>
      <p>${p.tags.join(" ")}</p>
      <p><img src="${p.authorAvatar}" class="avatar">${p.authorName}</p>
      ${(p.authorName===currentUser.name) ? `<button class="editBtn" data-index="${index}">Редактировать</button>` : ""}
    `;
    galleryDiv.appendChild(div);
  });

  document.querySelectorAll(".editBtn").forEach(btn=>{
    btn.onclick=()=>{
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
  renderGallery({author: author || null, tag: tag || null});
}

// --- Модальное окно ---
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
document.getElementById("addPostBtn").onclick = ()=> openModal();
document.getElementById("closeModal").onclick = ()=> modal.style.display="none";

let editIndex = null;
function openModal(post=null,index=null){
  modal.style.display="flex";
  if(post){
    modalTitle.innerText="Редактировать пост";
    document.getElementById("postDesc").value=post.desc;
    document.getElementById("postTags").value=post.tags.join(" ");
    editIndex=index;
  } else {
    modalTitle.innerText="Новый пост";
    document.getElementById("postDesc").value="";
    document.getElementById("postTags").value="";
    document.getElementById("postImage").value=null;
    editIndex=null;
  }
}

// --- Сохранение поста ---
document.getElementById("savePost").onclick=()=>{
  const desc=document.getElementById("postDesc").value;
  const tags=document.getElementById("postTags").value.split(" ").map(t=>t.startsWith("#")?t:"#"+t).filter(t=>t);
  const file=document.getElementById("postImage").files[0];

  if(!desc) return alert("Введите описание");
  if(tags.length===0) return alert("Введите хотя бы один тег с #");

  if(editIndex!==null){
    posts[editIndex].desc=desc;
    posts[editIndex].tags=tags;
    if(file){
      const reader=new FileReader();
      reader.onload=()=>{
        posts[editIndex].image=reader.result;
        localStorage.setItem("posts",JSON.stringify(posts));
        renderGallery();
        modal.style.display="none";
      }
      reader.readAsDataURL(file);
    } else {
      localStorage.setItem("posts",JSON.stringify(posts));
      renderGallery();
      modal.style.display="none";
    }
  } else {
    if(!file) return alert("Выберите изображение");
    const reader=new FileReader();
    reader.onload=()=>{
      posts.push({
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        desc,
        tags,
        image:reader.result,
        date:new Date()
      });
      localStorage.setItem("posts",JSON.stringify(posts));
      renderGallery();
      modal.style.display="none";
    }
    reader.readAsDataURL(file);
  }
}

// --- Админ фон ---
if(currentUser.id===ADMIN_ID){
  const adminSection=document.getElementById("adminSection");
  const btn=document.createElement("button");
  btn.innerText="Сменить фон (GIF/Фото)";
  btn.onclick=()=>{
    const url=prompt("Введите URL фона (jpg, png, gif):");
    if(url) document.body.style.backgroundImage=`url('${url}')`;
  }
  adminSection.appendChild(btn);
}
