"use strict";
var TreeTable = (function($) {
	var defaultOptions = {
		isShowFirstNode:false,
		fontSize:14,
		rootNodeTilte:'编码'
	};

	return {
		source:null,
		//初始化对象
		init:function(treeData,$target,options) {
			options = options || {};
			var previewTargets = options.previewTargets;
			var params = $.extend(true,{},defaultOptions,options);
			$target.append(this.recure(treeData,""));
		    this.source = this.initHeight($target.children("ul"),params);
		    this.addSelectedEvent(this.source,previewTargets); //表格单元格添加点击事件
			return this.source; 
		},
		//递归获取ul字符串
		recure:function(data,domStr,level) {
			level = level || 1;

			if(level == 1) {
				domStr = '<ul class="treeTable">';
			} else {
				domStr += '<ul class="childUl" level="'+level+'">';
			}
			
			var node;
			for(var i=0,l=data.length; i<l; i++) {
				node = data[i];

				if(node.children && node.children.length) {
					domStr += '<li class="parentLi">'
						   + '<div><span>'+node.title+'</span></div>';
					domStr = this.recure(node.children,domStr,level+1);
					domStr += '</ul>'
					domStr + '</li>';
				} else {
					domStr += '<li class="leaf"><span>'+node.title+'</span></li>';
				}
			}

			if(level == 1) {
				domStr += '</ul>';
			} 
			return domStr;
		},
		//初始化组件高度
		initHeight:function($ul,params) {
			var isShowFirstNode = params.isShowFirstNode;
			var fontSize = params.fontSize;

			//使同一层级内的高度保持一致
		    $ul.find(".parentLi").each(function() {
		    	var $this = $(this);
		    	var height = 0;
		    	var divs = $this.find("div");
		    	var lis = $this.find("li");
		    	divs.each(function() {
		    		height+=$(this).height() + 1;
		    	});
		    	height+=lis.eq(0).height();
		    	$this.siblings().each(function() {
		    		$(this).height(height);
		    	});
		    });	

		     $ul.prepend('<li class="rootNode selected retain" style="display:none;"><span>'+params.rootNodeTilte+'</span></li>');
		     if(isShowFirstNode) {
		     	$ul.find(".rootNode").show();
		     } else {
		     	$ul.children("li").eq(1).addClass("firstNodeBorder");
		     }

		    //获取最高层级数,以便低层级标签与其他高层级标签对齐
		    var level = this.getCurrentMaxLevel($ul);

		    //存放顶级外各层级的最大高度
		    var childMaxHeight = {}; 
		    //获取顶级外各层级最大高度,并据之设置同级li标签高度相等
		    for(var i=2; i<=level; i++) {
		    	childMaxHeight[i] = 0;
		    	$ul.find(".childUl[level='"+i+"']").each(function() {
		    		var li0 = $(this).find("li").eq(0);
		    		var height = li0.height();
		    		if(height>childMaxHeight[i]) {
		    			childMaxHeight[i] = height;
		    		}	    		 
		    	});
		    }

		    //设置同一层级节点高度一致且文本居中,通过各层级最大高度处理
		    for(var j=2; j<=level; j++) {
		    	var h = childMaxHeight[j];
		    	$ul.find(".childUl[level='"+j+"']").each(function() {
		    		var lis = $(this).find("li");
			    	lis.each(function() {
			    		h = h || $(this).height();
			    		$(this).height(h);	
	    				$(this).css("line-height",h+"px");
			    	});
		    	});
		    }	    

		    //存放顶级的最大高度
		    var topMaxHeight = $ul.find(".rootNode").height() + childMaxHeight[2] + 1;
		    $ul.children("li").each(function() {
		    	$(this).height(topMaxHeight);
		    	$(this).css("line-height",topMaxHeight+"px");
		    });		    
		    return $ul;
		},
		getCurrentMaxLevel:function($ul) { //获取当前文档结构最大的层级数
		    var level = 1;
		    $ul.find("ul.childUl").each(function() {
		    	var liLevel = $(this).attr("level");
		    	if(liLevel > level) {
		    		level = liLevel;
		    	}
		    });
		    return level;
		},
		addSelectedEvent:function($ul,previewTargets) {
			var _this = this;
		    //父节点点击选中与去除选中处理
		    $ul.find(".parentLi div").click(function() {
		    	var $this = $(this);
		    	var parentLi = $this.parent("li.parentLi");
		    	var parentLis = $this.parents("li.parentLi");
	    		var parentLiSubLis;
	    		var parentLiSubLisSubDivs;
	    		var parentLiSibLis;
	    		var parentLiSibLisSubDivs;

		    	if(!$this.hasClass("retain")) {
		    		parentLiSubLis = parentLi.children("ul").find("li");
		    		parentLiSubLisSubDivs = parentLiSubLis.find("div");

		    		$this.addClass("selected").addClass("retain");
		    		parentLi.addClass("retain");
		    		parentLis.addClass("retain").children("div").addClass("selected").addClass("retain");
		    		parentLiSubLis.addClass("selected").addClass("retain");
		    		parentLiSubLisSubDivs.addClass("selected").addClass("retain");
		    	} else {	    		
	    			parentLiSibLis = $this.siblings("ul").find("li");
	    			parentLiSibLisSubDivs = parentLiSibLis.find("div");

	    			$this.removeClass("selected").removeClass("retain");
    				parentLi.removeClass("selected").removeClass("retain");
    				parentLiSibLis.removeClass("selected").removeClass("retain");
    				parentLiSibLisSubDivs.removeClass("selected").removeClass("retain");
    				parentLiSibLisSubDivs.parent("li").removeClass("selected").removeClass("retain").find("ul").find("li").removeClass("selected").removeClass("retain");
		    	}
		    	if(previewTargets && previewTargets.length) {
		    		for(var key in previewTargets) {
		    			_this.preview($(previewTargets[key]));
		    		}
		    	}
		    });

		    //叶子节点点击选中与去除选中处理
		    $ul.find("li.leaf").click(function() {
		    	var $this = $(this);
		    	var parentLi = $this.parent("ul").parent("li.parentLi");
		    	var parentLis = $this.parent("ul").parents("li.parentLi");
		    	var tempParentLi = $this.parent("ul").parent("li.parentLi");

		    	if(!$this.hasClass("selected")) {
					$this.addClass("selected").addClass("retain").parents("li").addClass("retain").children("div").addClass("selected").addClass("retain");
		    	} else { //如果选中叶子节点被选中过,则需要删除选中
		    		var isRemoveAll = true;

		    		//默认先除去所点击叶子节点的选中样式,以便后续判断之用
		    		$this.removeClass("selected").removeClass("retain"); 

		    		//判断当前节点的所有父节点层级,所判断父节点当前是否有叶子节点选中,如果没有则删除该父节点选中
		    		while(tempParentLi.length == 1) {
		    			isRemoveAll = true;
		    			tempParentLi.children("ul").children("li").each(function() {
			    			if($(this).hasClass("retain")) {		    				
			    				isRemoveAll = false;
			    			}
			    		});
			    		if(isRemoveAll) { //所判断父节点没有叶子节点,删除该父节点选中
		    				tempParentLi.removeClass("retain");
		    				tempParentLi.children("div").removeClass("selected").removeClass("retain");
			    		}
			    		//继续遍历,如果所选元素数组不为1,则已到达顶级
			    		tempParentLi = tempParentLi.parent("ul").parent("li"); 
		    		}
		    	}
		    	if(previewTargets && previewTargets.length) {
		    		for(var key in previewTargets) {
		    			_this.preview($(previewTargets[key]));
		    		}
		    	}
		    });
		},
		preview:function($target) {
			if(!$target) {
				return;
			}

			if($(document.body).find(".ruler").length <= 0) {
				$(document.body).append('<span class="ruler" style="visibility:hidden;"></span>');
			}

			function visualLength(text) { 
				var ruler = $(".ruler"); 
				ruler.text(text); 
				return ruler[0].offsetWidth; 
			}

			var sourceHTML = this.source.prop("outerHTML");
			$target.empty();	    	
	    	$target.append(sourceHTML);

	    	//移除没有选中的叶子节点
		    $target.find("li").each(function() {
		    	var $this = $(this);
		    	if(!$this.hasClass("retain")) {
		    		$this.remove();
		    	}
		    });
		    //移除没有选中的父节点显示文本
		    $target.find("div").each(function() {
		    	var $this = $(this);
		    	if(!$this.hasClass("retain")) {
		    		$this.remove();
		    	}
		    });

		    var $ul = $target.children("ul.treeTable");
		    if($(".rootNode").is(":hidden") && $ul.find(".firstNodeBorder") != 1) {
		    	$ul.children("li").eq(1).addClass("firstNodeBorder");
		    }

		    //获取最高层级数,用于计算所选中各层级的宽度
		    var level = this.getCurrentMaxLevel($ul);

		    //存放顶级外各层级的当前选中宽度
		    var levelWidth = {}; 
		    var tempWidth = 0;

		    //获取顶级外各层级的当前选中宽度,通过倒叙获得
	    	$ul.children(".parentLi.retain").each(function() {
	    		var index = $(this).index();
	    		var childUlLis;
	    		var lisLength;

	    		for(var i=level; i>=2; i--) {
		    		tempWidth = 0;
		    		childUlLis = $(this).find(".childUl[level='"+i+"']>li");
	    		 	lisLength = childUlLis.length;

		    		childUlLis.each(function() {
		    			if(i==level || !$(this).hasClass("parentLi")) {
		    				tempWidth += $(this).innerWidth();
		    			} else {
	    					tempWidth += levelWidth[index+"_"+(i+1)];
		    			}
			    	});
			    	tempWidth += lisLength - 1; 
			    	levelWidth[index+"_"+i] = tempWidth;
	    		}
	    	});

	    	$ul.children(".parentLi.retain").each(function() {
	    		var index = $(this).index();
	    		for(var i=level; i>=2; i--) {
		    		tempWidth = 0;
		    		$(this).find(".childUl[level='"+i+"']").each(function() {
		    			var parentLi = $(this).parent("li");
		    			var div = parentLi.children("div");
		    			var lis = parentLi.children("ul").children("li");
		    			var lisLength = lis.length;
		    			var unitWidth = 0;
		    			var divWidth = div.width();
		    			var divTextWidth = parseInt(visualLength(div.text()));
		    			var paddingLeft = parseInt(div.innerWidth() - divWidth);

		    			if((divTextWidth+paddingLeft*2) > levelWidth[index+"_"+i]) {
		    				unitWidth = (divTextWidth+paddingLeft*2-levelWidth[index+"_"+i])*1.0/lisLength;
		    				lis.each(function() {
		    					$(this).width($(this).width() + unitWidth);
		    				});
		    			} 
			    	});
	    		}
	    	});
		}
	};
})(jQuery);