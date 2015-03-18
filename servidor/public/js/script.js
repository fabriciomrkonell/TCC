'use strict';

{% if message != null %}
	alert("{{message}}");
{% endif %}

function toggleDropdown(){
	if(document.getElementById("dropdown").classList.contains("open")){
		document.getElementById("dropdown").classList.remove("open");
	}else{
		document.getElementById("dropdown").classList.add("open");
	}
};