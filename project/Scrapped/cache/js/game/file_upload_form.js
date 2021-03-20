window.FileUploadForm = (function() {
	'use strict';

	var FileUploadForm = {

		last_iframe_id: 0,
		callbacks: {},

		createiFrame: function(parent,id){
			var iframe = $('<iframe src="javascript:false;" name="' + id + '" id="' + id + '" onload="FileUploadForm.iFrameLoaded(\''+id+'\')"></iframe>');
			$(iframe).css('display','none');
			$(parent).append(iframe);
		},

		createForm: function(parent, id, iframe_id, url){
			var form = $('<form id="'+ id +'" method="post" enctype="multipart/form-data"></form>');

			$(form).attr('action',url);
			$(form).attr('target',iframe_id);
			//$(form).css('display','none');

			$(parent).append(form);
		},

		createFileUploadForm: function(parent,url){
			var local_iframe_id = FileUploadForm.last_iframe_id++;
			FileUploadForm.createiFrame(parent,'iframe_'+local_iframe_id);
			FileUploadForm.createForm(parent,'form_'+local_iframe_id,'iframe_'+local_iframe_id,url);
		},

		createFileUploadFormEx: function(parent,url,form_id){
			var local_iframe_id = FileUploadForm.last_iframe_id++;
			FileUploadForm.createiFrame(parent,'iframe_'+local_iframe_id);
			FileUploadForm.createForm(parent,form_id,'iframe_'+local_iframe_id,url);
		},

		hookOnExsitingForm: function(form,callback){
			var local_iframe_id = FileUploadForm.last_iframe_id++;
			FileUploadForm.registerCallback(callback,'iframe_'+local_iframe_id);
			FileUploadForm.createiFrame($(form).parent(),'iframe_'+local_iframe_id);
			$(form).attr('target','iframe_'+local_iframe_id);
			$(form).attr('method','post');
			$(form).attr('enctype','multipart/form-data');
		},

		iFrameLoaded: function(iframe_id){
			//Is called twice per iFrame since the appendation of the iframe
			//already calls this function ones and the actual loading process
			//later on will call it again

			FileUploadForm.callCallback(iframe_id);
		},

		registerCallback: function(callback,iframe_id){
			FileUploadForm.callbacks[iframe_id] = {};
			FileUploadForm.callbacks[iframe_id].callback = callback;
			FileUploadForm.callbacks[iframe_id].fired = 0;
			FileUploadForm.callbacks[iframe_id].suppressed = 0;
		},

		callCallback: function(iframe_id){
			if(FileUploadForm.callbacks[iframe_id]){
				if(FileUploadForm.callbacks[iframe_id].suppressed === 0){
					FileUploadForm.callbacks[iframe_id].suppressed++;
					return;
				}
				FileUploadForm.callbacks[iframe_id].fired++;
				FileUploadForm.callbacks[iframe_id].callback();
			}
		}

	};

	return FileUploadForm;
}());
