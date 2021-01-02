class Region{
	code;
	name;
	
	constructor(c, n, i){
		this.code = c;
		this.name = n;
		this.id = i;
	}
	
	toString(){
		return "REGION: code " + this.code + ", name " + this.name + ";"
	}
}

class MultipleSelection{
	
	current;
	next;
	
	constructor(c, n){
		this.current = c;
		this.next = n;
	}
	
	hasNext(){
		if (this.next != null)	return true;
		else	return false;
	}
	
	add(n){
		if (this.next == null)
			this.next = new MultipleSelection(n, null);
		else {
			var pointer = this;
			while (pointer.next != null)
				pointer = pointer.next;
			pointer.next = new MultipleSelection(n, null);
		}
	}
	
	toString(){
		if (this.next == null)
			return this.current.toString();
		else 
			return this.current.toString() + "\n" + this.next.toString();
	}
}