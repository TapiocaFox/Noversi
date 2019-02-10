let _NSc = new NSc();
var country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
		,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
		,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
		,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
		,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
		,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
		,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
		,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
		,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
		,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
		,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
		,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
		,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
		,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)"
		,"Yemen","Zambia","Zimbabwe"];

_NSc.connect('0.0.0.0');
_NSc.createActivitySocket('NoUser', (err, as)=>{
  $(function() {
    let status = $('#status');


    // signup
    $('#signupform').submit(function() {
      as.call('createUser',
       {un: $("#signupform-username").val(),
       dn: null,
       pw: $("#signupform-password").val(),
       cp: $("#signupform-passwordcomfirm").val(),
       dt: null,
       fn: $("#signupform-firstname").val(),
       ln: $("#signupform-lastname").val()},
       (err, json) => {
         if(json.e) {
           status.html('<span style="color: #E91E63">'+json.s+'</span>');
         }
         else {
           status.html('<span style="color: #4CAF50">'+json.s+'</span>');
					 _NSc.getImplement((err, implement_module)=>{

						 setTimeout(()=>{
							 implement_module.returnImplement('logout')();
							 window.location.replace('NoUserSettings.html');
						 }, 1000);
	         });
         }
      });
      return false;
    })


    // user profile
    let profile_list = $('#profile-list');
    let additem_p = (label, contain)=>{
      if(contain==null) {
        contain = '';
      }
      profile_list.append('<li id="'+label+'" class="nouser-settings-list-detail"><label for="'+label+'-contain">'+label+'</label><p id="'+label+'-contain">'+contain+'</p></li>');
      return $('#'+label);
    }
    let editable_text = (li, allownull)=>{
      li.click(()=>{
        let editbox = $('#editor');
        if(editbox.length == 0) {
          let original = _text = $('#'+li.attr('id')+'-contain').html();
          if(original==null || original=='') {
            original='null';
          }
          $('#'+li.attr('id')+'-contain').html('<input class="nouser-settings-list-textinput" id="editor" type="text" placeholder="'+original+'">');
          editbox = $('#editor');
          editbox.focusout(()=>{
            if(editbox.val() == ''&&!allownull) {
              $('#'+li.attr('id')+'-contain').html(_text);
            }
            else {
              $('#'+li.attr('id')+'-contain').html(editbox.val());
            }
          });
          editbox.on('keypress', (e)=> {
            if(e.which === 13){
              editbox.blur();
            }
          });
          editbox.focus();
        }
      });
    };
    let editable_select = (li, items, allownull)=>{
      li.click(()=>{

        let editbox = $('#'+li.attr('id')+'-editor');
        if(editbox.length == 0) {
          let original = _text = $('#'+li.attr('id')+'-contain').html();
          if(original==null || original=='') {
            original='';
          }
          let beinserted = '<select class="nouser-settings-list-" id="'+li.attr('id')+'-editor"><option selected="selected">'+original+'</option>';
          for(let i in items) {
            beinserted+='<option>'+items[i]+'</option>';
          }
          beinserted+='</select>';
          $('#'+li.attr('id')+'-contain').html(beinserted);
          editbox = $('#'+li.attr('id')+'-editor');
          editbox.focusout(()=>{
            if(editbox.val() == ''&&!allownull) {
              $('#'+li.attr('id')+'-contain').html(_text);
            }
            else {
              $('#'+li.attr('id')+'-contain').html(editbox.val());
            }
          });
          editbox.on('keypress', (e)=> {
            if(e.which === 13){
              editbox.blur();
            }
          });
          editbox.focus();
        }
      });
    };
    let editable_date = (li, allownull)=>{
      li.click(()=>{
        let editbox = $('#editor');
        if(editbox.length == 0) {
          let original = _text = $('#'+li.attr('id')+'-contain').html();
          if(original==null || original=='') {
            original='null';
          }
          $('#'+li.attr('id')+'-contain').html('<input class="nouser-settings-list-textinput" id="editor" type="date" value="'+original+'">');
          editbox = $('#editor');
          editbox.focusout(()=>{
            if(editbox.val() == ''&&!allownull) {
              $('#'+li.attr('id')+'-contain').html(_text);
            }
            else {
              $('#'+li.attr('id')+'-contain').html(editbox.val());
            }
          });
          editbox.on('keypress', (e)=> {
            if(e.which === 13){
              editbox.blur();
            }
          });
          editbox.focus();
        }
      });
    };
    if(profile_list.length != 0) {
      as.call('returnUserMeta', {}, (err, json)=>{
        let username = additem_p('username', json.username);
        let userid = additem_p('userid', json.userid);
        editable_text(additem_p('firstname', json.firstname));
        editable_text(additem_p('lastname', json.lastname));
        editable_text(additem_p('email', json.email));
        editable_select(additem_p('gender', json.gender), ['male', 'female', 'other']);
        editable_text(additem_p('phone', json.phonenumber));
        editable_date(additem_p('birthday', json.birthday));
        editable_select(additem_p('country', json.country), country_list);
        editable_text(additem_p('address', json.address));
        editable_text(additem_p('aboutme', json.aboutme), true);
        let password = additem_p('newpassword', '<input class="nouser-settings-list-textinput" id="newpassword-text" type="password" placeholder="newpassword">');
        let comfirmpassword = additem_p('comfirm newpassword', '<input class="nouser-settings-list-textinput" id="comfirmpassword-text" type="password" placeholder="comfirm">');
        $('#update-submit').click(()=>{
          as.call('updateUser', {
            firstname: $('#firstname-contain').html(),
            lastname: $('#lastname-contain').html(),
            email: $('#email-contain').html(),
            gender: $('#gender-contain').html(),
            phonenumber: $('#phone-contain').html(),
            birthday: $('#birthday-contain').html(),
            country: $('#country-contain').html(),
            address: $('#address-contain').html(),
            aboutme: $('#aboutme-contain').html(),
            pw: $('#newpassword-text').val(),
            cp: $('#comfirmpassword-text').val()
          }, (err, json)=>{
            if(json.e) {
              status.html('<span style="color: #E91E63">'+json.s+'</span>');
            }
            else {
              status.html('<span style="color: #4CAF50">'+json.s+'</span>');
            }
          })
        });
      })
    }
    as.onClose=()=>{

    };
  });
});
