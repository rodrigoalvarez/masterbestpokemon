
$(document).ready(function () {
    $("#xBackup").click(backup);
    $("#xRestore").click(restore);
});

function backup() {
    $.get('backup', function (data) {
        $("#xData").val(data);
    });
}

function restore() {
    $.ajax({
        url: 'restore',
        type: 'PUT',
        data: JSON.stringify({backup: $("#xData").val()}),
        contentType: 'application/json',
        success: function () {
        }
    });
}
