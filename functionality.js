$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

function analyse() {
  console.log("Analyse Clicked")

  usertext = $("#user-text-input").val()

  linkerPicked = $('#linker-picker').val()
  
  modelPicked = $('#model-picker').val()
  model2url = {
    '0': 'https://128.2.204.127:8124/run_linker',
    '1': 'https://128.2.204.127:8125/run_linker',
    '2': 'https://128.2.204.127:8126/run_linker'
  }

  msg = {
    "id": Math.floor(Math.random() * 100000),
    "data": {
      "text": [usertext],
      "entity_linker": linkerPicked
    }
  }

  var settings = {
    "url": model2url[modelPicked],
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": JSON.stringify(msg),
    "error": errorHandler
  };

  $.ajax(settings).done(function (response) {
    printResponse(response);
    annotatedText = prepareAnnotatedText(response);
    insertResults(annotatedText);
  });
}

function printResponse(response) {
  console.log(response);
}

function prepareAnnotatedText(response) {  
  mentions = response["result"]["elinks"][0]["mentions"];
  userText = response["result"]["elinks"][0]["text"];

  console.log(userText);
  console.log(mentions);

  for (let index = mentions.length-1; index >= 0; index--) {
  // for (let index =0; index < mentions.length; index++) {

    element = mentions[index];
    console.log(element);

    var predicted = "";
    pred_type = element["pred_type"][0];
    if (pred_type === undefined) {
      predicted = "Other";
    } else {
      predicted = element["pred_type"][0];
      if (element["pred_type"].length > 1) {
        for (let index = 1; index < element["pred_type"].length; index++) {
          predicted = predicted + ", " + element["pred_type"][index];
        }
      }
    }
    console.log(predicted);

    best_candidate = ""
    best_score = -1
    element["candidates"].forEach(e => {      
      if (e[1] > best_score) {
        best_score = e[1]
        best_candidate = e[0]
      }
    });

    insertEndAt = element["end_offset"];
    insertStartAt = element["start_offset"];

    front = userText.slice(0, insertEndAt) + "</mark>";
    rear = userText.slice(insertEndAt);
    userText = front + rear;

    tagToInsert = "<mark data-entity='"+ predicted +"'>";
    if(element["pred_type"].length > 1) {    
      // generateCssForMultiMark(predicted);
    }    
    front = userText.slice(0, insertStartAt) + tagToInsert;
    rear = userText.slice(insertStartAt);
    userText = front + rear;
  }

  return userText;
}


function insertResults(annotatedText) {
  $("#annotated-text").empty();
  $("#annotated-text").append(annotatedText);
}


function errorHandler() {
  alert("some error has occurred");
}


function copyToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
  $.notify("Copied " + text, "success");
}

function launch_umls() {
  window.open("https://uts.nlm.nih.gov/metathesaurus.html");
}
