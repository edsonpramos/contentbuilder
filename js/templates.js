var templates = {
    _globals:{
    },
    accordion:{
        properties:{
            started:false,
            template_full:null,
            template_parent:null,
            template_child:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.accordion.properties.started){
                templates.accordion.properties.template_full = $("#template_accordion").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").split("##");
                templates.accordion.properties.template_parent = templates.accordion.properties.template_full[0];
                templates.accordion.properties.template_child = templates.accordion.properties.template_full[1];
                templates.accordion.properties.template_tool = templates.accordion.properties.template_full[2];
                templates.accordion.properties.template_modal = templates.accordion.properties.template_full[3];
                templates.accordion.properties.started = true;
            }
            //chama o modal
            templates.utils.modal.openModal('Conteúdo do Accordion', templates.accordion.properties.template_modal, templates.accordion.mergeContent,'',ui);
        },
        mergeContent:function(template_id,ui){
            var parent_id, child_id, parent, child;
            //função pode ser chamada por nova instancia ou por edição dela
            if(template_id == ""){
                parent_id = templates.utils.getUid();
                parent = $(templates.accordion.properties.template_parent.replace(/(\{\{id\}\})/g,parent_id));
            }else{
                parent_id = template_id.split('_')[1];
                parent = $(template_id);
                parent.children('div').remove();
            }
            
            $('#accordionModalContent').children('p').each(function(i){
                //limpa códigos do word
                var this_str = templates.utils.regex.toClear($(this).html().toString(), ['op','spanopen','spanclose']); ;
                //inicia novo child ou o finaliza
                if(templates.utils.regex.gt.test(this_str)){
                    this_str = templates.utils.regex.toClear(this_str, ['gt']);//limpa ">>"
                    child_id = templates.utils.getUid();
                    child = $(templates.accordion.properties.template_child.replace(/(\{\{id\}\})/g,parent_id).replace(/(\{\{childId\}\})/g,child_id));
                    //insere texto do head
                    child.find('.accordion-toggle').eq(0).html(this_str);
                    //retira o parágrafo padrão
                    child.find('.bloco').eq(0).html("");
                }else{
                    //insere texto do body
                    child.find('.bloco').eq(0).append($('<p>'+this_str+'</p>'));
                    parent.append(child);
                }
            });
            
            if(template_id == ""){
                parent.append(templates.accordion.defineTools(parent_id));
                parent.mouseover(function(e){
                    $(this).children('ul:first').removeClass('hide');
                }).mouseout(function(e){
                    $(this).children('ul:first').addClass('hide');
                });
                templates.utils.appendAll('accordion',parent,ui);
            }
        },
        defineTools:function(parent_id){
            var tools = $(templates.accordion.properties.template_tool.replace(/(\{\{id\}\})/g,parent_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var parent_id = $(this).parent().data('target');
                var filledModal = getAppendedContent($(this).parent().data('target'));
                templates.utils.modal.openModal('Conteúdo do Accordion', filledModal, templates.accordion.mergeContent, parent_id,'');
                
                function getAppendedContent(template_id){
                    var content = "";
                    var itens = $(template_id).children('div');//não pega o filho UL
                    
                    for (var x = 0; x < itens.length; x++){
                       content += ("<p>&gt;&gt;"+itens.eq(x).find('.accordion-toggle').eq(0).html().toString()+"</p>");
                       content += itens.eq(x).find('.bloco').eq(0).html().toString();
                    }
                    
                    var template_modal = $(templates.accordion.properties.template_modal);
                       template_modal.find('.editable').eq(0).html(content);
                    
                    return template_modal;
                }
            });
            //DELETE
            tools.children('.bt_delete:eq(0)').click(function(){
                $($(this).parent().data('target')).remove();
            });
            return tools;
        },
        
    },
    utils:{
        appendAll:function(template_name,parent,ui){
            var block_name = 'bloco-'+template_name;
            var block = $('<div class="bloco '+block_name+' ui-sortable-handle"></div>');
			block.html(parent);
            ui.helper.after(block);
            ui.helper.remove();
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
                    modal_body.children().each(function(i){$(this).remove()});
                    modal_body.append(template_modal);
                    
            },
            checkIfModalIsAppended:function(){
                if($('#modal').size() == 0){
                    $('body').append($('#template_modal').html());
                }
            },
            openModal:function(modal_label, template_modal, sendContent, id, ui){
                templates.utils.modal.checkIfModalIsAppended();
                templates.utils.modal.appendModalBody(template_modal);
                
                $('#modalLabel').html(modal_label);
                $('#modalButton').unbind('click').bind('click',function(){
                    sendContent(id,ui);
                    $('#modal').modal('hide');
                });
                $('#modal').modal({
                    backdrop:'static',
                    keyboard:false,
                })/*.on('shown',function(){
                    $('#modal').find('.editable').each(function(i){
                        if(typeof($(this).attr('id')) != "undefined"){
                            var thisID = $(this).attr('id');
                            CKEDITOR.disableAutoInline = true;
                            CKEDITOR.inline(thisID);
                        }
                    });
                })*/;
            },
        },
        regex:{
            gt : /&gt;&gt;/,
            op : /<o:p><\/o:p>/,
            popen : /<p[^>]*>/gi,
            pclose : /<\/p>/gi,
            spanopen : /<span[^>]*>/gi,
            spanclose : /<\/span>/gi,
            toClear : function(str,regexlist){
                for( item in regexlist){
                    str = str.replace(templates.utils.regex[regexlist[item]],"");
                }
                return str;
            },
        },
    },
  };