// 燈箱控制
export function openLightbox(url) {
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  modalImg.src = url;
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

export function closeLightbox() {
  const modal = document.getElementById('imgModal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
    document.getElementById('modalImg').src = '';
  }, 300);
  document.body.style.overflow = '';
}