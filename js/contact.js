$(document).ready(function () {
    $('.modal').on('hidden.bs.modal', function () {
        $(this).find('form')[0].reset();
    });
    $("#reused_form").submit(function (e) {

        $.ajax({
            type: "POST",
            url: 'https://www.enformed.io/39zuwrro/',
            data: $("#reused_form").serialize(),
            success: function (data) {
                $('#contactModal').modal('hide');
                $('#infoBar').html(
                    "<div class='alert alert-success alert-dismissible fade show' \
                    <button type='button' class='close' data-dismiss='alert'>&times;</button> \
                    Your message has been sent! \
                    </div>"
                );
            }
        });

        e.preventDefault();
    });
});

