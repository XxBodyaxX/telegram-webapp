const tg = window.Telegram?.WebApp;
const userId = tg?.initDataUnsafe?.user?.id || "guest";
const username = tg?.initDataUnsafe?.user?.first_name || "Гость";
document.getElementById("username").innerText = username;

const profileTab = document.getElementById("profileTab");
const galleryTab = document.getElementById("galleryTab");
const profileSection = document.getElementById("profileSection");
const gallerySection = document.getElementById("gallerySection");

profileTab.onclick = () => { profileSection.style.display="block"; gallerySection.style.display="none"; }
galleryTab.onclick = () => { profileSection.style.display="none"; gallerySection.style.display="block"; }

let posts = JSON.parse(localStorage.getItem("posts") || "[]");

const galleryDiv = document.getElementById("gallery");
function renderGallery(filter={}) {
  galleryDiv.innerHTML = "";
  let filtered = posts;
  if(filter.author) filtered = filtered.filter(p=>p.author==filter.author);
  if(filter.tag) filtered = filtered.filter(p=>p.tags.includes(filter.tag));
  filtered.forEach(p=>{
    const div = document.createElement("div");
    div.className="post";
    div.innerHTML = `<img src="${p.image}" alt=""><p>${p.desc}</p><p>${p.tags}</p>`;
    galleryDiv.appendChild(div);
  });
}
renderGallery();

document.getElementById("applyFilter").onclick = ()=>{
  const author = document.getElementById("filterAuthor").value;
  const tag = document.getElementById("filterTag").value;
  renderGallery({author, tag});
}

const modal = document.getElementById("modal");
document.getElementById("addPostBtn").onclick = ()=> modal.style.display="flex";
document.getElementById("closeModal").onclick = ()=> modal.style.display="none";

document.getElementById("savePost").onclick = ()=>{
  const desc = document.getElementById("postDesc").value;
  const tags = document.getElementById("postTags").value.split(" ");
  const file = document.getElementById("postImage").files[0];
  if(!file) return alert("Выберите фото");

  const reader = new FileReader();
  reader.onload = ()=>{
    posts.push({author:userId, desc, tags, image:reader.result, date:new Date()});
    localStorage.setItem("posts", JSON.stringify(posts));
    renderGallery();
    modal.style.display="none";
  }
  reader.readAsDataURL(file);
}
