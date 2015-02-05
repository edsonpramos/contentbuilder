var templates = {
    _globals:{
        moveme : '',
    },
    //========================================= crop ==========================================
    crop:{
        properties:{
            started:false,
            template_full:null,
            template_crop:null,
            template_tool:null,
            template_modal:null,
            instances:null,
            tempData:null,
        },
        init:function(ui){
            templates.crop.setProperties();
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do crop', templates.crop.properties.template_modal, templates.crop.mergeContent,templates.utils.getUid(),ui);
        },
        setProperties : function(){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.crop.properties.started){
                templates.crop.properties.template_full = $("#template_crop").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.crop.properties.template_crop = templates.crop.properties.template_full[0];
                templates.crop.properties.template_tool = templates.crop.properties.template_full[1];
                templates.crop.properties.template_modal = templates.crop.properties.template_full[2];
                templates.crop.properties.instances = {};
                templates.crop.properties.tempData = {
                    buttonpos : 0,
                    percent : 0,
                    left : 0,
                    top : 0,
                    width : 0,
                    height : 0,
                };
                templates.crop.properties.started = true;
            }
        },
        mergeContent:function(template_id,ui){
            var template, content, content_text = [], tool, flagImageBox = false, url, anchor, img, file;
            
            template = $(templates.crop.properties.template_crop);
            
            content_text.push(setClasses(template));
            
           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#cropModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            content = $(content);
            
            content.each(function(i){
                //busca token >>
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    flagImageBox = true;
                }else{
                    if(flagImageBox){
                        content_text[0].append($(this));//insere como legenda
                    }else{
                        content_text.push($(this));//insere como texto
                    }
                }
            });
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(content_text);
            }else{
                tool = templates.crop.defineTools(template_id,"");
                content_text.push(tool);
                templates.utils.appendAll('crop',content_text,ui,template_id,templates.crop.utils.setImageSource,template_id);
            };
            
            function setClasses(template){
                var checkeds = $('#cropModalClasses').find('input:checked');
              
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         template.addClass(checkeds.eq(x).val());
                    }
                }
                
                return template;
            }
        },
        resizeImageBox:function(template_id,ui){
            var imageBox = $('#bloco_'+template_id).find('.box-imagem').eq(0);
                  imageBox.removeAttr('class').addClass('box-imagem');
            
            var checkeds = $('#cropModalClasses').find('input:checked');
            for(var x = 0; x < checkeds.length; x++){
                 imageBox.addClass(checkeds.eq(x).val());
            }
            templates.crop.utils.resizeFrame(template_id);
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.children('.tool').eq(0) : $(templates.crop.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do crop', filledModal, templates.crop.resizeImageBox, template_id,'');
                
                function getAppendedContent(template_id){
                    var crop, cropClasses, input, urltoken, anchoropen = '', anchorclose = '', template_modal;
                    crop = $('#bloco_'+template_id).find('.box-imagem').eq(0).clone();
                    cropClasses = crop.attr('class').split(' ');
                    
                    template_modal = $(templates.crop.properties.template_modal);
                    template_modal.find('#cropModalFile').remove();
                    template_modal.find('#cropModalContent').remove();
                    
                    for(x = 0; x < cropClasses.length; x++){
                        input = template_modal.find('#cropModal_'+cropClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            templates.utils.setMoveToButton(tools, templates.crop.utils.resizeFrame, template_id);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
        utils:{
            setImageSource : function(template_id){
                var file = document.getElementById("cropModalFile"),
                      reader = new FileReader();
                reader.onload = function(e) {
                    var result = e.target.result;
                    templates.crop.utils.setCropBox(result,template_id);
                }
                reader.readAsDataURL(file.files[0]);
                file.files = [];
            },
            setCropBox : function(result,template_id){
                var block = $('#bloco_' + template_id),
                       image = block.find('.box-imagem').eq(0).find('img').eq(0),
                       download = block.find('.download').eq(0).find('a').eq(0);
                var cropwidth = parseInt(block.find('.box-imagem').eq(0).width());
                image.attr('src',result);
                image.cropbox({width:cropwidth}).on('cropbox', function(event, result, img) {
                    download.attr('href', img.getDataURL());
                });
                templates.crop.properties.instances["crop_"+template_id] = image.data('cropbox');
                templates.crop.utils.dragResizeButton(template_id,block,image,download);
            },
            resizeFrame : function(template_id){
                var block = $('#bloco_'+template_id);
                var imageBlockWidth =  block.find('.box-imagem').eq(0).width();
                var download = block.find('.download').eq(0).find('a').eq(0);
                var cropFrame = block.find('.cropFrame').eq(0);
                var instance = templates.crop.properties.instances['crop_'+template_id];
                var resizeButton = block.find('.btResize').eq(0);

                instance.options.width = imageBlockWidth;

                cropFrame.css('width',imageBlockWidth+'px');
                resizeButton = templates.crop.utils.defineResizeButton(resizeButton,cropFrame);
            },
            defineResizeButton : function(resizeButton,cropFrame){
                return resizeButton.css({
                    top: (cropFrame.position().top + cropFrame.height() + 10 ) +"px",
                    left: (cropFrame.position().left + (cropFrame.width()*.5) - 5) + "px",
                    display:"block",
                });
            },
            dragResizeButton : function(template_id,block,image,download){
                var cropFrame = block.find('.cropFrame').eq(0),
                      resizeButton = block.find('.btResize').eq(0);
                
                templates.crop.utils.defineResizeButton(resizeButton,cropFrame)
                .draggable({ 
                    axis: "y" ,
                    cursor: "n-resize",
                    start:function(event,ui){
                        templates.crop.utils.setTempData(ui,template_id);
                    },
                    drag: function( event, ui ) {
                        templates.crop.utils.setFrameHeight(ui,cropFrame,image);
                    },
                    stop: function(event, ui){
                        download.attr('href', templates.crop.utils.getNewCrop(template_id));
                    },
                });
            },
            setFrameHeight : function(ui,cropFrame,image){
                var height = (ui.position.top - cropFrame.position().top - 10);
                templates.crop.properties.tempData.height = height;
                cropFrame.css('height', height+"px");
                image.attr('cropheight',height);
            },
            setTempData : function(ui,template_id){
                var crop = templates.crop.properties.instances["crop_"+template_id];
                var tempData = templates.crop.properties.tempData;
                tempData.buttonpos = ui.position.top;
                tempData.percent = crop.percent;
                tempData.left = crop.img_left;
                tempData.top = crop.img_top;
                tempData.width = crop.img_width;
            },
            getNewCrop : function(template_id){
                var crop = templates.crop.properties.instances["crop_"+template_id];
                var tempData = templates.crop.properties.tempData;
                crop.options.height = tempData.height;
                crop.percent = tempData.percent;
                crop.img_left = tempData.left;
                crop.img_top = tempData.top;
                crop.img_width = tempData.width;
                
                crop.result = {
                    cropX: -(crop.img_left / crop.percent),
                    cropY: -(crop.img_top / crop.percent),
                    cropW: (crop.img_width / crop.percent),
                    cropH: (crop.options.height / crop.percent),
                    stretch: false
                }
                
                crop.setCrop(crop.result);
                return crop.getDataURL();
            }
        }
    },
    //========================================= CONTAINER ==========================================
    container:{
        properties:{
            started:false,
            template_full:null,
            template_ctn_1_2:null,
            template_ctn_2_1:null,
            template_ctn_3:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            templates.container.setProperties();
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do container', templates.container.properties.template_modal, templates.container.mergeContent,templates.utils.getUid(),ui);
        },
        setProperties : function(){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.container.properties.started){
                templates.container.properties.template_full = $("#template_container").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.container.properties.template_ctn_1_2 = templates.container.properties.template_full[0];
                templates.container.properties.template_ctn_2_1 = templates.container.properties.template_full[1];
                templates.container.properties.template_ctn_3 = templates.container.properties.template_full[2];
                templates.container.properties.template_tool = templates.container.properties.template_full[3];
                templates.container.properties.template_modal = templates.container.properties.template_full[4];
                templates.container.properties.started = true;
            }
        },
        mergeContent:function(template_id,ui){
            var ctn, tool;
            
            ctn = $('#containerModal').find('input:checked').eq(0).val();
            
            ctn = $(templates.container.properties['template_' + ctn]);
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(ctn);
            }else{
                tool = templates.container.defineTools(template_id,"");
                templates.utils.appendAll('container',[ctn,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.children('.tool').eq(0) : $(templates.container.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            templates.utils.setMoveToButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= UTILS ==========================================
    utils:{
        appendAll:function(template_name,elements,ui,template_id,callback,args){
            var block_name = 'bloco-'+template_name;
            var block = $('<div id="bloco_'+template_id+'" class="bloco row-fluid '+block_name+'"></div>');
            
            block.append(elements);
            templates.utils.blockMouseHandler(block);
            
            ui.helper.after(block);
            ui.helper.remove();
            
            templates.utils.checkActive(template_name,template_id);
            
            if(typeof(callback) == "function"){
                if(typeof(args) != "undefined"){
                    callback(args);
                }else{
                    callback();
                }
            }
        },
        attachInlineEditor:function(){
            $('#modal').find('.modal-body').eq(0).find('.editable').each(function(i){
                if(typeof($(this).attr('id')) != "undefined"){
                    var id = $(this).attr('id');
                    var editor = CKEDITOR.instances[id];
                    var template_name = id.substring(0, id.indexOf("Modal"));
                    
                    if(editor){
                       editor.removeAllListeners();
                       CKEDITOR.remove(editor);
                       $('#cke_'+id).remove();
                    }
                    editor = CKEDITOR.inline(document.getElementById(id));
                    editor.config.toolbar = templates.utils.getToolbar(template_name);
                }
            });
        },
        blockMouseHandler : function(block){
            block.mouseover(function(e){
                e.stopPropagation();
                $(this).children('ul.tool:eq(0)').removeClass('hide');
            }).mouseout(function(e){
                e.stopPropagation();
                $(this).children('ul.tool:eq(0)').addClass('hide');
            });
        },
        checkActive:function(template_name,template_id){
            if(template_name == "tab"){
                $('#tab_'+template_id+' a:first').tab('show');
            }
        },
        dettachInlineEditor:function(){
            $('#modal').find('.modal-body').eq(0).find('.editable').each(function(i){
                 if(typeof($(this).attr('id')) != "undefined"){
                    var id = $(this).attr('id');
                    var editor = CKEDITOR.instances[id];
                    
                    if(editor){
                        editor.removeAllListeners();
                        CKEDITOR.remove(editor);
                        $('#cke_'+id).remove();
                    }
                }
            });
        },
        getToolbar:function(template_name){
            var basics = { 
                copypaste : [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ],
                tbl : ['Table'],
                link : [ 'Image','Link','Unlink'],
                list : [ 'NumberedList','BulletedList','-','Outdent','Indent'],
                style : [ 'Bold', 'Italic','Subscript','Superscript'],
                fmt : ['Format'],
            }
            
            var normal = [basics.copypaste, basics.link, '/', basics.style, basics.list, basics.fmt];
            
            var toolbar = {
                accordion : normal,
                box : normal,
                carousel : [basics.copypaste, basics.link, '/', basics.style, basics.fmt],
                pict: [basics.copypaste, basics.link, '/', basics.style, basics.fmt],
                tab : normal,
                table : [basics.copypaste, basics.link, basics.tbl, '/', basics.style, basics.list, basics.fmt],
                text : normal,
                texteye : normal,
                crop : normal,
            };
            
            return toolbar[template_name];
        
        },
        getUid:function() {
            var s4 = new Array(8);
            for(var x=0; x < 8; x++){
                s4[x] = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4[0] + s4[1] + '-' + s4[2] + '-' + s4[3] + '-' + s4[4] + '-' + s4[5] + s4[6] + s4[7];
        },
        modal:{
            appendModalBody:function(template_modal){
                var modal_body = $('#modal').children('.modal-body').eq(0);
                    modal_body.children().remove();
                    modal_body.append(template_modal);
            },
            checkIfModalIsAppended:function(){
                if($('#modal').size() == 0){
                    $('body').append($('#template_modal').html());
                    
                    $('#modal').on({
                        'shown' : templates.utils.attachInlineEditor,
                        'hidden' : templates.utils.dettachInlineEditor,
                    });
                }
            },
            openModal:function(modal_label, template_modal, sendContent, id, ui){
                templates.utils.modal.checkIfModalIsAppended();
                templates.utils.modal.appendModalBody(template_modal);
                
                $('#modalLabel').html(modal_label);
                
                //undefined se vier do controler html-tocopy
                if(typeof(sendContent) == "function"){
                    $('#modalButton').show().unbind('click').bind('click',function(){
                        sendContent(id,ui);
                        $('#modal').modal('hide');
                    });
                }else{
                    $('#modalButton').hide();
                }
                $('#modalCancel').unbind('click').bind('click',function(){
                    if(typeof(ui.helper) != "undefined"){
                        ui.helper.remove();
                        console.log(ui.helper);
                    }
                    $('#modal').modal('hide');
                });
                
                $('#modal').modal({
                    backdrop:'static',
                    keyboard:false,
                });
            },
        },
        rebindTools:function(block){
            var template_name, template_id, tool;
            template_name = templates.utils.regex.findTemplate.exec(block.attr('class'));
            template_name = template_name.toString().split('-')[1];
            template_id = block.attr('id').split('_')[1];
            
            //ativa as variaveis dos templates;
            templates[template_name].setProperties();
            
            //não possui tool?
            if(block.find('.tool').size() == 0){
                tool = $(templates[template_name].properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
                block.append(tool);
            }
            
            templates[template_name].defineTools(template_id,block);
        },
        regex:{
            allGt : /&gt;/gi,
            allLt : /&lt;/gi,
            allTags : /<[^>]*>/gi,
            anchor : /<a[^>]*>/,
            br: /<br.*>/gi,
            findTemplate : /bloco-[^\s]*/,
            gt : /&gt;&gt;/,
            op : /<o:p>.*<\/o:p>/gi,
            popen : /<p[^>]*>/gi,
            pclose : /<\/p>/gi,
            pstyle : / style="[^"]*"/gi,
            spanopen : /<span[^>]*>/gi,
            spanclose : /<\/span>/gi,
            msoClass : / class="MsoNormal"/gi,
            returns :/[\n\r\t]/gi,
            tableHeader : / class="MsoTableGrid[^"]*"/gi,
            tableCel : / width="[^"]*"/gi,
            tableBorder: /border="[^"]*"/,
            tableSpacing : /cellspacing="[^"]*"/,
            tablePadding : /cellpadding="[^"]*"/,
            codeopen : /<code[^>]*>/gi,
            codeclose : /<\/code>/gi,
            wordTrash : ['tableCel','pstyle','tableBorder','tableSpacing','tablePadding'],
            cleanCode : function(str,regexlist){
                var regex_table = /<table/gi;
                
                for( item in regexlist){
                    str = str.replace(templates.utils.regex[regexlist[item]],"");
                }
                
                return str.replace(regex_table,'<table class="table"');
            },
        },
        setDeleteButton : function(tools){
            tools.children('.bt_delete:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                $('#bloco_'+template_id).remove();
            });
        },
        setMoveUpButton : function(tools){
            tools.children('.bt_moveup:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var bloco = $('#bloco_'+template_id);
                if(bloco.prev().size() > 0) bloco.insertBefore(bloco.prev());
            });
        },
        setMoveToButton : function(tools,callback,args){
            tools.children('.bt_moveto:eq(0)').click(function(){
                $('#miolo').sortable( "disable" ).addClass('cursor-moveto');
                templates._globals.moveme = $(this).parent().parent();//bloco pai
               
                $(document).keydown(function(e) {
                    // ESCAPE key pressed
                    if (e.keyCode == 27) {
                        //moveme possui um objeto?
                        if(templates._globals.moveme != "" && templates._globals.moveme.size() > 0){
                            $('#miolo').sortable( "enable" ).removeClass('cursor-moveto');
                            templates._globals.moveme = "";
                            $('.anchor').off();
                        }
                    }
                });
                
                $('.anchor').on({
                    click : function(e){
                        if(templates._globals.moveme != "" && templates._globals.moveme.size() > 0){
                            //não é anchor do próprio pai? evitar me.after(me);
                            if(templates._globals.moveme.attr('id') !=  $(this).parents('.bloco').attr('id')){
                                $('#miolo').sortable( "enable" ).removeClass('cursor-moveto');
                                $(this).after(templates._globals.moveme);
                                templates._globals.moveme = "";
                                $('.anchor').off();
                                if(typeof(callback) == "function"){
                                    if(typeof(args) != "undefined"){
                                        callback(args);
                                    }else{
                                        callback();
                                    }
                                }
                            }else{
                                console.log('bloco não pode ser inserido dentro de si mesmo');
                            }
                        }
                    },
                });
            });
        },
        wrapTemplateBlocks : function(content){
            var child, childToStr, newContent, textarea;
            
            newContent = $("<code></code>");
            
            content.children('.anchor').remove();
            
            for(var x = 0; x < content.children().length; x++){
                child = content.children().eq(x);
                
                //é bloco de outro template?
                if(child.attr('class').indexOf('bloco-') != -1){
                    textarea = $('<textarea contenteditable="false"></textarea>');
                    textarea.append(child);
                    newContent.append(textarea);
                }else{
                    newContent.append(child.html());
                }
            }
            return newContent.html().toString();
        },
    },
    //========================================= CONTROLERS ==========================================
    controlers:{
        btn_html_grid : {
            properties:{
                toogle:false,
            },
            init : function(){
                if(templates.controlers.btn_html_grid.properties.toogle){
                    $('.nogrid').removeClass('nogrid');
                    templates.controlers.btn_html_grid.properties.toogle = false;
                }else{
                    $('.ctn > div').addClass('nogrid');
                    $('.anchor').addClass('nogrid');
                    templates.controlers.btn_html_grid.properties.toogle = true;
                }
            },
        },
    },
  };