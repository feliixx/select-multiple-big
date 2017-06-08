# select-multiple-big

a small JS plugin build on top of JQuery and bootstrap to create a dropdown selector with live search that can handle very large number of items with 0 display latency. 

a live demo is available here ( with 100 000 items) : [live demo](https://codepen.io/adrienpetel/full/ZOorkZ/)

# How to use the plugin

first, add bootstrap and JQuery js and css : 

```html
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
...
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
```

then add an HTML **div** element somewhere in the DOM like this : 

```html
<div id="select"></div>
``` 
finally, instantiate the dropdown with some js code : 

```javascript
$('#select').selectmultiple({
  text: 'items',                          // title when no items selected 
  data: [ "item1", "item2", "item3" ],    // an array of string containing the list of item to display in the dropdown
  width: 200,                             // the dropdown width
  placeholder: 'items'                    // text-search placeholder 
});
```

when the user select some items, a custom event is fired : `multiple_select_change` 
you can catch it by adding a listener like this : 

```javascript
$('#select').on('multiple_select_change', function() {
  // do some stuff 
});
```

# Custom methods

get the number of selected items: 
```javascript
var count = $('#select').selectmultiple('count')
// count = 3
```
get the selected items: 
```javascript
var values =  $('#select').selectmultiple('value')
// values = [ "item1", "item11", "item111" ]
```

get all availables item in the dropdown: 
```javascript
var options = $('#select').selectmultiple('option')
// options = [ "item1", "item2", "item3", ... ]
```
