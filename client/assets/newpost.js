$(document).ready(function () {
  $("select").formSelect();
  $("input#input_text, input#title").characterCounter();
  $("input#input_text, textarea#details").characterCounter();
  $(".modal").modal();
  $("#searchBtn").hide();

  const instance = M.Modal.getInstance(modal1);

  // sets up req.params style way to access info
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const postIdNum = parseInt(postId);
  let userId;

  $.ajax({
    type: "GET",
    url: "/api/user_data",
  }).then((res) => {
    console.log(res.id);
    if (res.id === undefined) {
      window.location.replace("/");
    } else {
      userId = res.id;
    }
  });

  // if this is an update..
  if (postId != null) {
    // .. enable the delete button
    $("#delete").attr("class", "waves-effect waves-light btn");
    console.log(postIdNum);

    // // .. and get the post using it's ID
    // $.ajax({
    //   type: "GET",
    //   url: `TBD/${idNum}`, // TDB
    // }).then((res) => {
    //
    //   // Set the form up with values from the request
    //   $("#category").val(res.category);
    //   $("#title").val(res.title);
    //   $("#details").val(res.details);
    //   $("#imgURL").val(res.imgURL);
    //   $("#imptURL").val(res.imptURL);
    // });

    // otherwise, disable the delete button
  } else {
    $("#delete").attr("class", "waves-effect waves-light btn disabled");
  }

  let post = {
    userId: "",
    category: "",
    title: "",
    details: "",
    imageURL: "",
    imptURL: "",
  };

  // Materialize returns a STRING number for .val()
  $("#category").on("change", () => {
    if ($("#category").val() == 3) {
      $("#searchBtn").show();
    } else {
      $("#searchBtn").hide();
    }
  });

  $("#previewBtn").on("click", () => {
    $("#form-img").attr("src", $("#imgURL").val());
  });

  $("#searchBtn").on("click", () => {
    if ($("#title").val() === "") {
      instance.open();
    } else {
      // if the category is 'movies'

      if ($("#category").val() == 3) {
        $.ajax({
          type: "GET",
          // Key will eventually be hidden using axios and api-routes
          url: `http://www.omdbapi.com/?apikey=fe8b2a76&t=${$("#title").val()}`,
        }).then((res) => {
          $("#details").val(`Plot: ${res.Plot}\n
IMDB Rating: ${res.imdbRating}/10\n
Rotten Tomatoes: ${res.Ratings[1].Value}\n
Released: ${res.Year}\n
Director(s): ${res.Director}`);

          $("#imgURL").val(res.Poster);
        });
      }
    }
  });

  // When the submit button is clicked..
  $("#btnSubmit").on("click", () => {
    // set the values for the post object
    post.userId = userId;
    post.category = $("#category").val();
    post.title = $("#title").val();
    post.details = $("#details").val();
    post.imageURL = $("#imgURL").val();
    post.imptURL = $("#imptURL").val();

    // If any required fields are blank..
    if (
      $("#category").val() === null ||
      $("#title").val() === "" ||
      $("#details").val() === "" ||
      $("#imgURL").val() === "" ||
      post.title.length > 100 ||
      post.details.length > 500
    ) {
      // show the modal
      instance.open();
      // otherwise..
    } else {
      // if there isn't a post ID..
      if (postId === null) {
        console.log("no id");
        console.log(post);

        // ..submit a new post

        $.ajax({
          type: "POST",
          url: "/api/add",
          data: post,
        }).then((res) => {
          M.toast({ html: "Successfully submitted new post" });
          setTimeout(() => window.location.replace("/feed"), 1500);
        });

        // ..otherwise..
      } else {
        // ..get the postId and add it to the post object
        post.postId = postIdNum;
        console.log(post);

        // ..then submit an update

        // $.ajax({
        //   type: "POST",
        //   url: "/api/update",
        //   data: post,
        // }).then((res) => {
        //   M.toast({ html: "Successfully updated post" });
        //   setTimeout(() => window.location.replace("/feed"), 1500);
        // });
      }
    }
  });

  // a simple redirect, does nothing else
  $("#cancel").on("click", () => window.location.replace("/feed"));

  // this works so long as the URL is:
  // 'localhost:3000/newpost?id=' and a valid post ID (valid in your db)
  $("#delete").on("click", () => {
    post.postId = postIdNum;
    $.ajax({
      type: "POST",
      url: "/api/delete",
      data: post,
    }).then((res) => {
      M.toast({ html: "Successfully deleted post" });
      setTimeout(() => window.location.replace("/feed"), 1500);
    });
  });
});
