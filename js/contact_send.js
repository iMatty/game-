$("#reused_form").submit(function(e) {

    $.ajax({
           type: "POST",
           url: 'https://www.enformed.io/39zuwrro/',
           data: $("#reused_form").serialize(), 
           success: function(data)
           {
               alert("Tanks for feedback");
		 $('#myModal').modal('hide')
           }
         });

    e.preventDefault(); 
});