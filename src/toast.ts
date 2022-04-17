customElements.define('br-toast',
  class BRToastElement extends HTMLElement {
    constructor() {
        super();
        let template = document.getElementById('br-toast').cloneNode(true) as HTMLTemplateElement;
        let templateContent = template.content;

        if (this.querySelector('[slot="title"]')){
            templateContent.querySelector('slot[name="title"]').replaceWith(this.querySelector('[slot="title"]'))
        }
        if (this.querySelector('[slot="content"]')) {
            templateContent.querySelector('slot[name="content"]').replaceWith(this.querySelector('[slot="content"]'))
        }

        this.appendChild(templateContent);
  }

  
})

export function createToast(title: string|Node, content: string|Node, time: number|null = null){
    function removeToast(){
        toast.remove()
    }

    const template = document.getElementById('br-toast').cloneNode(true) as HTMLTemplateElement
    let toast = document.createElement('div')
    toast.appendChild(template.content);

    toast.querySelector('slot[name="title"]').replaceWith(title)
    toast.querySelector('slot[name="content"]').replaceWith(content)
    document.getElementById('toatsWrapper').appendChild(toast)
    if (time){
        setTimeout(removeToast, time)
    }

}