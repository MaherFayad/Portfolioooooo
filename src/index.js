function sendMail() {
    var params = {
      name: document.getElementById("full-name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };
  
    const serviceID = "service_c8jd2lr";
    const templateID = "template_5z1q5qe";
  
      emailjs.send(serviceID, templateID, params)
      .then(res=>{
          document.getElementById("full-name").value = "";
          document.getElementById("email").value = "";
          document.getElementById("message").value = "";
          console.log(res);
          alert("Your message sent successfully!!")
  
      })
      .catch(err=>console.log(err));
  
  }