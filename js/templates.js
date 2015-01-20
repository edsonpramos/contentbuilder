var templates = {
    _globals:{
    },
    //========================================= ACCORDION ==========================================
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
                templates.accordion.properties.template_full = $("#template_accordion").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.accordion.properties.template_parent = templates.accordion.properties.template_full[0];
                templates.accordion.properties.template_child = templates.accordion.properties.template_full[1];
                templates.accordion.properties.template_tool = templates.accordion.properties.template_full[2];
                templates.accordion.properties.template_modal = templates.accordion.properties.template_full[3];
                templates.accordion.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do Accordion', templates.accordion.properties.template_modal, templates.accordion.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var child_id, template, child, tool, content, textarea, templateBlock;

            template = $(templates.accordion.properties.template_parent.replace(/(\{\{id\}\})/g,template_id));
            
            //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#accordionModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
           
            content.each(function(i){
                //inicia novo child ou o finaliza
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    $(this).html(templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));//limpa ">>"
                    child_id = templates.utils.getUid();
                    child = $(templates.accordion.properties.template_child.replace(/(\{\{id\}\})/g,template_id).replace(/(\{\{childId\}\})/g,child_id));
                    //insere texto do head
                    child.find('.accordion-toggle').eq(0).html($(this).html().toString());
                }else{
                    if(typeof(child) != "undefined"){//enquanto não achar o primeiro token ">>", child será undefined
                        textarea = $(this).find('textarea');
                        //este conteúdo é um outro template?
                        if(textarea.size() > 0){
                            templateBlock = $(textarea.eq(0).html().toString().replace(templates.utils.regex.allLt,'<').replace(templates.utils.regex.allGt,'>'));
                            child.find('.accordion-inner').eq(0).append(templateBlock);
                            templates.utils.blockMouseHandler(templateBlock);
                            templates.utils.rebindTools(templateBlock);
                        }else{
                            child.find('.toappend').eq(0).append($(this));
                        }
                        template.append(child);
                    }
                }
            });
            
            //acerta o "collapse in"
            template.find('.accordion-body').eq(0).addClass('in');
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(template);
            }else{
                tool = templates.accordion.defineTools(template_id,"");
                templates.utils.appendAll('accordion',[template,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.accordion.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do Accordion', filledModal, templates.accordion.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var content = "";
                    var itens = $('#accordion_'+template_id).children();
                    
                    //pega o conteúdo de cada aba do accordion
                    for (var x = 0; x < itens.length; x++){
                       content += ("<p>&gt;&gt;"+itens.eq(x).find('.accordion-toggle').eq(0).html().toString()+"</p>");
                       content += wrapTemplateBlocks(itens.eq(x).find('.accordion-inner').eq(0).clone());
                    }
                    
                    var template_modal = $(templates.accordion.properties.template_modal);
                       template_modal.find('.editable').eq(0).html(content);
                    
                    return template_modal;
                }
                
                function wrapTemplateBlocks(content){
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
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= TAB ==========================================
    tab:{
        properties:{
            started:false,
            template_full:null,
            template_parent:null,
            template_child_nav:null,
            template_child_pane:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.tab.properties.started){
                templates.tab.properties.template_full = $("#template_tab").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace('> <','><').split("##");
                templates.tab.properties.template_parent = templates.tab.properties.template_full[0],
                templates.tab.properties.template_child_nav = templates.tab.properties.template_full[1],
                templates.tab.properties.template_child_pane = templates.tab.properties.template_full[2],
                templates.tab.properties.template_tool = templates.tab.properties.template_full[3],
                templates.tab.properties.template_modal = templates.tab.properties.template_full[4],
                templates.tab.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do tab', templates.tab.properties.template_modal, templates.tab.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var child_id, template_nav, template_pane, child_nav, child_pane, tool, pos, content, textarea, templateBlock;

            template = $(templates.tab.properties.template_parent.replace(/(\{\{id\}\})/g,template_id));
            template_nav = template.eq(0);
            template_pane = template.eq(1);
            
            //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#tabModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
        
            content.each(function(i){
                //inicia novo child ou o finaliza
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    pos = (typeof(pos) != "undefined")? pos+1 : 0;
                    $(this).html(templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));//limpa ">>"
                    child_id = templates.utils.getUid();
                    child_nav  = $(templates.tab.properties.template_child_nav.replace(/(\{\{childId\}\})/g,child_id));
                    child_pane = $(templates.tab.properties.template_child_pane.replace(/(\{\{childId\}\})/g,child_id));
                    //insere texto de navegação
                    child_nav.find('a').eq(0).html($(this).html());
                    template_nav.append(child_nav);
                    template_pane.append(child_pane);
                }else{
                    //insere texto do body
                    textarea = $(this).find('textarea');
                    //este conteúdo é um outro template?
                    if(textarea.size() > 0){
                        templateBlock = $(textarea.eq(0).html().toString().replace(templates.utils.regex.allLt,'<').replace(templates.utils.regex.allGt,'>'));
                        template_pane.find('.toappend').eq(pos).append(templateBlock);
                        templates.utils.blockMouseHandler(templateBlock);
                        templates.utils.rebindTools(templateBlock);
                    }else{
                        template_pane.find('.toappend').eq(pos).append($(this));
                    }
                }
            });
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append([template_nav,template_pane]);
            }else{
                tool = templates.tab.defineTools(template_id,"");
                templates.utils.appendAll('tab',[template_nav,template_pane,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.tab.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do tab', filledModal, templates.tab.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var content = "";
                    var itens_nav = $('#tab_'+template_id).children();
                    var pane_anchor, pane;
                    
                    for (var x = 0; x < itens_nav.length; x++){
                       pane_anchor = itens_nav.eq(x).children().eq(0);
                       pane = $(pane_anchor.attr('href'));
                       content += ("<p>&gt;&gt;"+pane_anchor.html().toString()+"</p>");
                       content += pane.find('.bloco').eq(0).html().toString();
                    }
                    
                    var template_modal = $(templates.tab.properties.template_modal);
                       template_modal.find('.editable').eq(0).html(content);
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= CAROUSEL ==========================================
    carousel:{
        properties:{
            started:false,
            template_full:null,
            template_parent:null,
            template_child_indicator:null,
            template_child_inner:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.carousel.properties.started){
                templates.carousel.properties.template_full = $("#template_carousel").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.carousel.properties.template_parent = templates.carousel.properties.template_full[0];
                templates.carousel.properties.template_child_indicator = templates.carousel.properties.template_full[1];
                templates.carousel.properties.template_child_inner = templates.carousel.properties.template_full[2];
                templates.carousel.properties.template_tool = templates.carousel.properties.template_full[3];
                templates.carousel.properties.template_modal = templates.carousel.properties.template_full[4];
                templates.carousel.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do carousel', templates.carousel.properties.template_modal, templates.carousel.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var child_id, template, child_inner, child_indicator, tool, content, idx;

            template = $(templates.carousel.properties.template_parent.replace(/(\{\{id\}\})/g,template_id));
            
           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#carouselModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
           
            content.each(function(i){
                //inicia novo child ou o finaliza
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    idx = (typeof(idx) != "undefined")? idx+1 : 0;
                    $(this).html(templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));//limpa ">>"
                    child_id = templates.utils.getUid();
                    child_inner = $(templates.carousel.properties.template_child_inner);
                    child_indicator = $(templates.carousel.properties.template_child_indicator.replace(/\{\{id\}\}/g,template_id).replace(/\{\{num\}\}/g,idx));
                    //insere link
                    child_inner.find('img').eq(0).attr('src',$(this).html().toString());
                    template.find('.carousel-indicators').eq(0).append(child_indicator);
                    template.find('.carousel-inner').eq(0).append(child_inner);
                }else{
                    if(typeof(child_inner) != "undefined"){//enquanto não achar o primeiro token ">>", child será undefined
                        //insere legenda
                        template.find('.carousel-caption').eq(idx).append($(this));
                    }
                }
            });
            
            //define o active
            template.find('.carousel-indicators').eq(0).children().eq(0).addClass('active');
            template.find('.carousel-inner').eq(0).children().eq(0).addClass('active');
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(template);
            }else{
                tool = templates.carousel.defineTools(template_id,"");
                templates.utils.appendAll('carousel',[template,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.carousel.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do carousel', filledModal, templates.carousel.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var content = "";
                    var itens = $('#carousel_'+template_id).children('.carousel-inner').eq(0).children();
                    
                    for (var x = 0; x < itens.length; x++){
                       content += ("<p>&gt;&gt;"+itens.eq(x).find('img').eq(0).attr('src')+"</p>");
                       content += itens.eq(x).find('.carousel-caption').eq(0).html().toString();
                    }
                    
                    var template_modal = $(templates.carousel.properties.template_modal);
                    template_modal.find('.editable').eq(0).html(content);
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
                        
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= TABLE ==========================================
    table:{
        properties:{
            started:false,
            template_full:null,
            template_caption:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.table.properties.started){
                templates.table.properties.template_full = $("#template_table").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.table.properties.template_caption = templates.table.properties.template_full[0];
                templates.table.properties.template_tool = templates.table.properties.template_full[1];
                templates.table.properties.template_modal = templates.table.properties.template_full[2];
                templates.table.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do table', templates.table.properties.template_modal, templates.table.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var content, tool, table, caption;

           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#tableModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
            
            for(var x=0;x<content.length;x++){
                
                if(content.eq(x).get(0).tagName == "TABLE"){
                    table = content.eq(x);
                    table.attr('id','table_'+template_id);
                    break;
                }
            }
            
            if(typeof(table) != "undefined") {
                if($('#tableModalCaption').val() != "") {
                    caption =  $(templates.table.properties.template_caption);
                    caption.html($('#tableModalCaption').val());
                    table.prepend(caption);
                }
                
                if($('#tableModalWidhts').val().indexOf(',') != -1){
                    table = setWidths(table,$('#tableModalWidhts').val());
                } 
                
                table = setClasses(table);
                
                //Verifica existência do bloco do template
                if($('#bloco_'+template_id).size() > 0){
                    $('#bloco_'+template_id).children().not('.tool').remove();
                    $('#bloco_'+template_id).append(table);
                }else{
                    tool = templates.table.defineTools(template_id,"");
                    templates.utils.appendAll('table',[table,tool],ui,template_id);
                };
            }else{
                if(typeof(ui.helper) != "undefined")ui.helper.remove();
                console.log('Este template precisa conter uma tabela');
            }
            
            function setWidths(table,widths){
                var widths = widths.split(',');
                var cels = table.find('tr').eq(0).children();
                
                if(widths.length == cels.length){
                    for(var x = 0; x < cels.length; x++){
                        cels.eq(x).attr('class','span'+widths[x])
                    }
                }
                return table;
            }
            
            function setClasses(table){
                var checkeds = $('#tableModalClasses').find('input:checked');
                
                if(!table.hasClass('table')){
                    table.addClass('table');
                }
                
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         table.addClass(checkeds.eq(x).val());//classes += (" ."+checkeds.eq(x).val());
                    }
                   //table.attr('class',classes);
                }
                
                return table;
            }
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.table.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do table', filledModal, templates.table.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var content = "";
                    var table = $('#table_'+template_id).clone();
                    var tr = table.find('tr').eq(0);
                    var cels = tr.children('td');
                    var widths = "";
                    var tdClasses, tableClasses, spanNum, caption;
                    var input;
                    var regex = /span[^\s]*/;
                    var regex2 = /class\s?="[^"]*span[^"]*"/;
                    
                    //para pegar as larguras definidas pra cada coluna
                    if(regex2.test(tr.html().toString())){
                        for (var x = 0; x < cels.length; x++){
                            tdClasses = cels.eq(x).attr('class');
                             
                            if(tdClasses.indexOf('span') != -1){
                                spanNum = regex.exec(tdClasses).toString().replace('span','');
                                widths += ((widths != "")? ','+spanNum : spanNum);
                            }
                            cels.eq(x).removeAttr('class');
                        }
                    }
                    
                    tableClasses = table.attr('class').split(' ');
                    
                    var template_modal = $(templates.table.properties.template_modal);
                    
                    caption = table.children('caption').eq(0);
                    caption.remove();
                    template_modal.find('#tableModalCaption').eq(0).val(caption.html());
                    
                    template_modal.find('#tableModalWidhts').eq(0).val(widths);
                    
                    //marca os checkboxes dos estilos usados
                    for(x = 0; x < tableClasses.length; x++){
                        input = template_modal.find('#tableModal_'+tableClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    table.removeAttr('class').removeAttr('id').addClass('table');
                    
                    template_modal.find('.editable').eq(0).html(table);
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },  
    //========================================= BOX ==========================================
    box:{
        properties:{
            started:false,
            template_full:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.box.properties.started){
                templates.box.properties.template_full = $("#template_box").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.box.properties.template_tool = templates.box.properties.template_full[0];
                templates.box.properties.template_modal = templates.box.properties.template_full[1];
                templates.box.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do box', templates.box.properties.template_modal, templates.box.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var content, tool;

           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#boxModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = templates.utils.regex.checkTagLess(content);
            content = $('<div id="box_'+template_id+'">'+ content + '</div>');
            
            content = setClasses(content);
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(content);
            }else{
                tool = templates.box.defineTools(template_id,"");
                templates.utils.appendAll('box',[content,tool],ui,template_id);
            };
            
            function setClasses(content){
                var checkeds = $('#boxModalClasses').find('input:checked');
                
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         content.addClass(checkeds.eq(x).val());
                    }
                }
                
                return content;
            }
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.box.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do box', filledModal, templates.box.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var box = $('#box_'+template_id).clone();
                    var boxClasses = box.attr('class').split(' ');
                    
                    var template_modal = $(templates.box.properties.template_modal);
                    
                    for(x = 0; x < boxClasses.length; x++){
                        input = template_modal.find('#boxModal_'+boxClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    
                    template_modal.find('.editable').eq(0).html(box.html());
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= pict ==========================================
    pict:{
        properties:{
            started:false,
            template_full:null,
            template_pict:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.pict.properties.started){
                templates.pict.properties.template_full = $("#template_pict").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.pict.properties.template_pict = templates.pict.properties.template_full[0];
                templates.pict.properties.template_tool = templates.pict.properties.template_full[1];
                templates.pict.properties.template_modal = templates.pict.properties.template_full[2];
                templates.pict.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do pict', templates.pict.properties.template_modal, templates.pict.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var template, content, tool;
            
            template = $(templates.pict.properties.template_pict.replace(/(\{\{id\}\})/g,template_id));
            template = setClasses(template);

           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#pictModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
            
            content.each(function(i){
                //busca token >>
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    template.children('img').eq(0).attr('src', templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));
                }else{
                    template.append($(this));
                }
            });
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(template);
            }else{
                tool = templates.pict.defineTools(template_id,"");
                templates.utils.appendAll('pict',[template,tool],ui,template_id);
            };
            
            function setClasses(template){
                var checkeds = $('#pictModalClasses').find('input:checked');
                
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         template.addClass(checkeds.eq(x).val());
                    }
                }
                
                return template;
            }
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.pict.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do pict', filledModal, templates.pict.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var pict = $('#pict_'+template_id);
                    var pictClasses = pict.attr('class').split(' ');
                    var urltoken = '<p>&gt;&gt;'+pict.children('img').eq(0).attr('src')+'</p>';
                    
                    var template_modal = $(templates.pict.properties.template_modal);
                    
                    for(x = 0; x < pictClasses.length; x++){
                        input = template_modal.find('#pictModal_'+pictClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    
                    template_modal.find('.editable').eq(0).append(urltoken,pict.children().not('img'));
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= TEXTPICT ==========================================
    textpict:{
        properties:{
            started:false,
            template_full:null,
            template_textpict:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.textpict.properties.started){
                templates.textpict.properties.template_full = $("#template_textpict").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.textpict.properties.template_textpict = templates.textpict.properties.template_full[0];
                templates.textpict.properties.template_tool = templates.textpict.properties.template_full[1];
                templates.textpict.properties.template_modal = templates.textpict.properties.template_full[2];
                templates.textpict.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do textpict', templates.textpict.properties.template_modal, templates.textpict.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var template, content, content_text = [], tool, flagImageBox = false, idx = 0;
            
            template = $(templates.textpict.properties.template_textpict);
            
            content_text.push(setClasses(template));
            
           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#textpictModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
            
            content.each(function(i){
                //busca token >>
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    content_text[0].children('img').eq(0).attr('src', templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));
                    flagImageBox = true;
                    idx++;
                }else{
                    if(flagImageBox){
                        content_text[0].append($(this));//content_text[0] = template
                        idx++
                    }else{
                        content_text.push($(this));
                        idx++
                    }
                }
            });
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(content_text);
            }else{
                tool = templates.textpict.defineTools(template_id,"");
                content_text.push(tool);
                templates.utils.appendAll('textpict',content_text,ui,template_id);
            };
            
            function setClasses(template){
                var checkeds = $('#textpictModalClasses').find('input:checked');
                
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         template.addClass(checkeds.eq(x).val());
                    }
                }
                
                return template;
            }
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.textpict.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do textpict', filledModal, templates.textpict.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var textpict = $('#bloco_'+template_id).find('.box-imagem').eq(0);
                    var textpictClasses = textpict.attr('class').split(' ');
                    var urltoken = '<p>&gt;&gt;'+textpict.children('img').eq(0).attr('src')+'</p>';
                    
                    var template_modal = $(templates.textpict.properties.template_modal);
                    
                    for(x = 0; x < textpictClasses.length; x++){
                        input = template_modal.find('#textpictModal_'+textpictClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    
                    template_modal.find('#textpictModalContent').eq(0).append($('#bloco_'+template_id).clone().children().not('.box-imagem,.tool'),urltoken,textpict.children().not('img'));
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= TEXTEYE ==========================================
    texteye:{
        properties:{
            started:false,
            template_full:null,
            template_texteye:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.texteye.properties.started){
                templates.texteye.properties.template_full = $("#template_texteye").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.texteye.properties.template_texteye = templates.texteye.properties.template_full[0];
                templates.texteye.properties.template_tool = templates.texteye.properties.template_full[1];
                templates.texteye.properties.template_modal = templates.texteye.properties.template_full[2];
                templates.texteye.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do texteye', templates.texteye.properties.template_modal, templates.texteye.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var template, content, content_text = [], tool, flagImageBox = false;
            
            template = $(templates.texteye.properties.template_texteye);
            
            content_text.push(setClasses(template));
            
           //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#texteyeModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se conteúdo veio sem tag
            content = $(templates.utils.regex.checkTagLess(content));
            
            content.each(function(i){
                //busca token >>
                if(templates.utils.regex.gt.test($(this).html().toString())){
                    content_text[0].append(templates.utils.regex.cleanCode($(this).html().toString(), ['gt']));
                    flagImageBox = true;
                }else{
                    if(flagImageBox){
                        content_text[0].append($(this));//content_text[0] = template
                    }else{
                        content_text.push($(this));
                    }
                }
            });
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(content_text);
            }else{
                tool = templates.texteye.defineTools(template_id,"");
                content_text.push(tool);
                templates.utils.appendAll('texteye',content_text,ui,template_id);
            };
            
            function setClasses(template){
                var checkeds = $('#texteyeModalClasses').find('input:checked');
                
                if(checkeds.length > 0){
                    for(var x = 0; x < checkeds.length; x++){
                         template.addClass(checkeds.eq(x).val());
                    }
                }
                
                return template;
            }
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.texteye.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do texteye', filledModal, templates.texteye.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var texteye = $('#bloco_'+template_id).find('.box-citacao').eq(0);
                    var texteyeClasses = texteye.attr('class').split(' ');
                    var texteyeToken = $('<p>&gt;&gt;'+texteye.html()+'</p>');
                    
                    var template_modal = $(templates.texteye.properties.template_modal);
                    
                    for(x = 0; x < texteyeClasses.length; x++){
                        input = template_modal.find('#texteyeModal_'+texteyeClasses[x]);
                        if(input.size() > 0){
                            input.attr('checked','checked');
                        }
                    }
                    
                    template_modal.find('#texteyeModalContent').eq(0).append($('#bloco_'+template_id).clone().children().not('.box-citacao,.tool'),texteyeToken);
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= TEXT ==========================================
    text:{
        properties:{
            started:false,
            template_full:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.text.properties.started){
                templates.text.properties.template_full = $("#template_text").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.text.properties.template_tool = templates.text.properties.template_full[0];
                templates.text.properties.template_modal = templates.text.properties.template_full[1];
                templates.text.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do text', templates.text.properties.template_modal, templates.text.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var content, tool;
            
            //limpa o html que veio do modal
            content = templates.utils.regex.cleanCode($('#textModalContent').html().toString(), templates.utils.regex.wordTrash).replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><');
            //checa se existe tag
            content = $(templates.utils.regex.checkTagLess(content));
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append(content);
            }else{
                tool = templates.text.defineTools(template_id,"");
                templates.utils.appendAll('text',[content,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.text.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do text', filledModal, templates.text.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var text = $('#bloco_'+template_id);
                    var template_modal = $(templates.text.properties.template_modal);
                    
                    template_modal.find('#textModalContent').eq(0).append(text.clone().children().not('.tool'));
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= video ==========================================
    video:{
        properties:{
            started:false,
            template_full:null,
            template_parent:null,
            template_script:null,
            template_sources:null,
            template_tracks:null,
            template_hidden:null,
            template_tool:null,
            template_modal:null,
        },
        init:function(ui){
            //sapara o conteúdo da tag script em strings distintas
            if(!templates.video.properties.started){
                templates.video.properties.template_full = $("#template_video").html().toString().replace(/[\n\r\t]/gi,"").replace(/\s{2,}/gi," ").replace(new RegExp("> <","gi"),'><').split("##");
                templates.video.properties.template_parent = templates.video.properties.template_full[0];
                templates.video.properties.template_script = templates.utils.regex.cleanCode(templates.video.properties.template_full[1],['codeopen','codeclose']);
                templates.video.properties.template_sources = templates.utils.regex.cleanCode(templates.video.properties.template_full[2],['codeopen','codeclose']);
                templates.video.properties.template_tracks = templates.utils.regex.cleanCode(templates.video.properties.template_full[3],['codeopen','codeclose']);
                templates.video.properties.template_hidden = templates.video.properties.template_full[4];
                templates.video.properties.template_tool = templates.video.properties.template_full[5];
                templates.video.properties.template_modal = templates.video.properties.template_full[6];
                templates.video.properties.started = true;
            }
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do video', templates.video.properties.template_modal, templates.video.mergeContent,templates.utils.getUid(),ui);
        },
        mergeContent:function(template_id,ui){
            var video, sources, captions, chapters, script, sourcesfull, sources = "", source, tracks, hiddenform, tool;
            
            //pega os dados do form
            sourcesfull = $('#video-sources').val().toString().replace(/[\n\r\t]/gi,"").split(';');
            captions = templates.video.properties.template_tracks.replace('\{\{file\}\}',$('#video-captions').val()).replace('\{\{kind\}\}','captions');
            chapters = templates.video.properties.template_tracks.replace('\{\{file\}\}',$('#video-chapters').val()).replace('\{\{kind\}\}','captions');
            
            for(var x=0; x < sourcesfull.length; x++){
                //if(sourcesfull[x].split(',').length >= 3){
                    source = sourcesfull[x].split(',');
                    sources += templates.video.properties.template_sources.replace('\{\{file\}\}',source[0]).replace('\{\{label\}\}',source[1]).replace('\{\{default\}\}',source[2]);
               // }
            }
           
            video = $(templates.video.properties.template_parent.replace('\{\{id\}\}',template_id));
            script = $('<script>' + templates.video.properties.template_script.replace('\{\{id\}\}',template_id).replace('\{\{sources\}\}',sources).replace('\{\{tracks\}\}',captions+chapters).replace('\{\{image\}\}',$('#video-image').val()) + '</script>');
            
            hiddenform = templates.video.properties.template_hidden.replace('\{\{id\}\}',template_id),
            hiddenform = hiddenform.replace('\{\{sources\}\}',$('#video-sources').val().toString().replace(/[\n\r\t]/gi,""));
            hiddenform = hiddenform.replace('\{\{captions\}\}',$('#video-captions').val());
            hiddenform = hiddenform.replace('\{\{chapters\}\}',$('#video-chapters').val());
            hiddenform = hiddenform.replace('\{\{image\}\}',$('#video-image').val());
            hiddenform = $(hiddenform);
            
            //Verifica existência do bloco do template
            if($('#bloco_'+template_id).size() > 0){
                $('#bloco_'+template_id).children().not('.tool').remove();
                $('#bloco_'+template_id).append([video,script,hiddenform]);
            }else{
                tool = templates.video.defineTools(template_id,"");
                templates.utils.appendAll('video',[video,script,hiddenform,tool],ui,template_id);
            };
        },
        defineTools:function(template_id,bloco_rebind){
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.video.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            //EDIT
            tools.children('.bt_edit:eq(0)').click(function(){
                var template_id = $(this).parent().data('target');
                var filledModal = getAppendedContent(template_id);
                //chama o modal para editar conteúdo
                templates.utils.modal.openModal('Conteúdo do video', filledModal, templates.video.mergeContent, template_id,'');
                
                function getAppendedContent(template_id){
                    var form_hidden = $('#bloco_'+template_id).find('.form-hidden').eq(0);
                    var sources = form_hidden.find('.video-sources').eq(0).val();
                    var captions = form_hidden.find('.video-captions').eq(0).val();
                    var chapters = form_hidden.find('.video-chapters').eq(0).val();
                    var image = form_hidden.find('.video-image').eq(0).val();
                    var template_modal = $(templates.video.properties.template_modal);
                    
                    template_modal.find('#video-sources').eq(0).val(sources);
                    template_modal.find('#video-captions').eq(0).val(captions);
                    template_modal.find('#video-chapters').eq(0).val(chapters);
                    template_modal.find('#video-image').eq(0).val(image);
                    
                    return template_modal;
                }
            });
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
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
            //chama o modal para inserir conteúdo
            templates.utils.modal.openModal('Conteúdo do container', templates.container.properties.template_modal, templates.container.mergeContent,templates.utils.getUid(),ui);
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
            var tools = (bloco_rebind != "") ? bloco_rebind.find('.tool').eq(0) : $(templates.container.properties.template_tool.replace(/(\{\{id\}\})/g,template_id));
            
            templates.utils.setDeleteButton(tools);
            templates.utils.setMoveUpButton(tools);
            
            if(bloco_rebind == ""){
                return tools;
            }
        },
    },
    //========================================= UTILS ==========================================
    utils:{
        appendAll:function(template_name,elements,ui,template_id){
            var block_name = 'bloco-'+template_name;
            var block = $('<div id="bloco_'+template_id+'" class="bloco '+block_name+' ui-sortable-handle"></div>');
            
            block.append(elements);
            templates.utils.blockMouseHandler(block);
            
            ui.helper.after(block);
            ui.helper.remove();
            
            templates.utils.checkActive(template_name,template_id);
        },
        attachInlineEditor:function(){
            $('#modal').find('.modal-body').eq(0).find('.editable').each(function(i){
                if(typeof($(this).attr('id')) != "undefined"){
                    var id = $(this).attr('id');
                    var editor = CKEDITOR.instances[id];
                    
                    if(editor){
                       editor.removeAllListeners();
                       CKEDITOR.remove(editor);
                       $('#cke_'+id).remove();
                    }
                    CKEDITOR.inline(document.getElementById(id));
                }
            });
        },
        blockMouseHandler : function(block){
            block.mouseover(function(e){
                $(this).children('ul.tool:eq(0)').removeClass('hide');
            }).mouseout(function(e){
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
                    if(typeof(ui.helper) != "undefined")ui.helper.remove();
                    $('#modal').modal('hide');
                });
                
                $('#modal').modal({
                    backdrop:'static',
                    keyboard:false,
                });
            },
        },
        rebindTools:function(block){
            var template_name, template_id;
            template_name = templates.utils.regex.findTemplate.exec(block.attr('class'));
            template_name = template_name.toString().split('-')[1];
            template_id = block.attr('id').split('_')[1];
            
            templates[template_name].defineTools(template_id,block);
        },
        regex:{
            allGt : /&gt;/gi,
            allLt : /&lt;/gi,
            findTemplate : /bloco-[^\s]*/,
            gt : /&gt;&gt;/,
            op : /<o:p>.*<\/o:p>/gi,
            popen : /<p[^>]*>/gi,
            pclose : /<\/p>/gi,
            pstyle : / style="[^"]*"/gi,
            spanopen : /<span[^>]*>/gi,
            spanclose : /<\/span>/gi,
            msoClass : / class="MsoNormal"/gi,
            tableHeader : / class="MsoTableGrid[^"]*"/gi,
            tableCel : / width="[^"]*"/gi,
            tableBorder: /border="[^"]*"/,
            tableSpacing : /cellspacing="[^"]*"/,
            tablePadding : /cellpadding="[^"]*"/,
            codeopen : /<code[^>]*>/gi,
            codeclose : /<\/code>/gi,
            //wordTrash : ['op','spanopen','spanclose','msoClass','tableHeader','tableCel','pstyle','tableBorder'],
            wordTrash : ['tableCel','pstyle','tableBorder','tableSpacing','tablePadding'],
            cleanCode : function(str,regexlist){
                var regex_table = /<table/gi;
                
                for( item in regexlist){
                    str = str.replace(templates.utils.regex[regexlist[item]],"");
                }
                
                return str.replace(regex_table,'<table class="table"');
            },
            checkTagLess : function(str){
                //se a string não estiver dentro de uma tag, insere.
                //Exceto os tokens >>
               /*
               var tagExists = /<[^>]*>.*<\/[^>]*>/;
                //var token = /^(\s)*>>/;
                if(!tagExists.test(str)){
                      str = '<div>'+str+'</div>';
                }*/
                
                return str;
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
    },
    //========================================= CONTROLERS ==========================================
    controlers:{
        btn_html_tocopy : {
            init : function(){
                var code = $('#miolo').clone();
                code.find('ul.tool').remove();
                code.find('.anchor').remove();
                code = $('<textarea class="html-tocopy"><div id="miolo">'+code.html().toString()+'</div></textarea>');
                templates.utils.modal.openModal('Código HTML pronto para copiar/colar', code, '', '', '');
            },
        
        },
        btn_html_save : {
            init : function(){},
        },
    },
  };