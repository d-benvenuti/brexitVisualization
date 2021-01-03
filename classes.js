class Region{
	code;
	name;
	
	constructor(c, n){
		this.code = c;
		this.name = n;
	}
	
	toString(){
		return "REGION: code " + this.code + ", name " + this.name + ";"
	}
	
	equals(r){
		if (this.code == r.code && this.name == r.name)
			return true;
		else
			return false;
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
	
	getLast(){
		if (this.next == null)
			return this.current;
		else{
			var pointer = this;
			while (pointer.next != null)
				pointer = pointer.next;
			return pointer.current;
		}
	}
	
	contains(r){
		var pointer = this;
		do{
			if (pointer.current.equals(r))
				return true;
			else {
				pointer = pointer.next;
			}
		}
		while (pointer != null);
		
	}
}