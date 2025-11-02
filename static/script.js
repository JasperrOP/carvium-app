var main = document.querySelector("#main")
var cursor = document.querySelector("#cursor")
var imageDiv = document.querySelector("#image")

main.addEventListener("mousemove",function(dets){
    gsap.to(cursor,{
        x:dets.x,
        y:dets.y,
        duration:0.7,
        ease:"back.out",
        
    })
})
const svg = document.querySelector("#string svg");
const pathEl = svg.querySelector("path");
const basePath = `M 10 100 Q 500 100 990 100`;

svg.addEventListener("mousemove", (e) => {
  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const newPath = `M 10 100 Q ${x} ${y} 990 100`;

  gsap.to(pathEl, {
    attr: { d: newPath },
    duration: 0.2,
    ease: "power3.out",
  });
});

svg.addEventListener("mouseleave", () => {
  gsap.to(pathEl, {
    attr: { d: basePath },
    duration: 1.5,
    ease: "elastic.out(1, 0.2)",
  });
});


gsap.to('#page2 h1', {
    x: '-50%',
    scrollTrigger: {
        trigger: "#page2",
        start: "top 0%", 
        end: "top -100%", 
        scrub: 2, 
        markers: false, 
        pin:true,
    }
});

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const dots = Array.from({length: 40}, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 3 + 1,
  alpha: Math.random() * 0.4 + 0.1,
  dx: (Math.random() - 0.5) * 0.3,
  dy: (Math.random() - 0.5) * 0.3
}));

function animateDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 100, ${dot.alpha})`;
    ctx.fill();
    dot.x += dot.dx;
    dot.y += dot.dy;

    if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;
  });
  requestAnimationFrame(animateDots);
}
animateDots();


document.addEventListener('DOMContentLoaded', function() {
    const predictionForm = document.getElementById('prediction-form-element');
    
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const formData = new FormData(this);
            const predictBtn = this.querySelector('.predict-btn');
            const originalBtnText = predictBtn.textContent;
            const resultContainer = document.getElementById('prediction-result');
            const predictionText = document.getElementById('prediction-text');
            
            
            predictBtn.textContent = 'Predicting...';
            predictBtn.disabled = true;
            
           
            resultContainer.style.display = 'none';
            
            fetch('/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.prediction) {
                    
                    predictionText.textContent = data.prediction;
                    predictionText.style.color = '#00ff88';
                    resultContainer.style.display = 'block';
                    
                  
                    resultContainer.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                } else if (data.error) {
                    
                    predictionText.textContent = data.error;
                    predictionText.style.color = '#ff4444';
                    resultContainer.style.display = 'block';
                    
                    
                    resultContainer.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                
                predictBtn.textContent = originalBtnText;
                predictBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                predictionText.textContent = 'Error: Could not connect to server. Please try again.';
                predictionText.style.color = '#ff4444';
                resultContainer.style.display = 'block';
                
                // Scroll to result
                resultContainer.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                
                predictBtn.textContent = originalBtnText;
                predictBtn.disabled = false;
            });
        });
    }
});

document.querySelectorAll("button,a,video, input, select").forEach(el => {
  el.addEventListener("mouseenter", () => gsap.to("#cursor", { scale: 1.5, backgroundColor: "#ffffffff" }));
  el.addEventListener("mouseleave", () => gsap.to("#cursor", { scale: 1, backgroundColor: "#04ac42" }));
});

window.addEventListener('load', () => {
  
  gsap.fromTo("#loader h2",
    { y: -20, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" }
  );


  gsap.to("#loader", {
    delay: 0.8,           
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    onComplete: () => {
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";

      
      const main = document.getElementById("main");
      if (main) {
        main.classList.add("visible"); 
      }
    }
  });
});

