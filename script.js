
// =========================================
// ALVOXIS — INTERACTIONS
// =========================================

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector("#menuToggle");
const navigation = document.querySelector("#navigation");


// NAVBAR BACKGROUND ON SCROLL

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


// MOBILE MENU

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
});


// CLOSE MOBILE MENU AFTER CLICKING A LINK

const navigationLinks = document.querySelectorAll(".navigation a");

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
