/**
 * Custom extensions to the gedcomx-js library.
 */

GedcomX.enableRsExtensions();
GedcomX.enableRecordsExtensions();

/**
 * Calculate the name of a person.
 * 
 * @return {String} name
 */
GedcomX.Person.prototype.getDisplayName = function(){
  if(this.getDisplay() && this.getDisplay().getName()){
    return this.getDisplay().getName();
  }
  let name = this.getNames().find(name => name.getPreferred()) || this.names[0];
  let nameForms = name ? name.getNameForms() : [];
  if(nameForms.length === 0){
    return '';
  }
  return nameForms[0].getFullText(true);
};

/**
 * Calculate the lifespan of a person.
 * 
 * @return {String} name
 */
GedcomX.Person.prototype.getLifespan = function(){
  if(this.getDisplay() && this.getDisplay().getLifespan()){
    return this.getDisplay().getLifespan();
  }
  let birth = this.getFactsByType('http://gedcomx.org/Birth')[0],
      christening = this.getFactsByType('http://gedcomx.org/Christening')[0],
      death = this.getFactsByType('http://gedcomx.org/Death')[0],
      burial = this.getFactsByType('http://gedcomx.org/Burial')[0],
      birthLike = birth || christening,
      deathLike = death || burial,
      birthYear = '', 
      deathYear = '';
  if(birthLike){
    let birthDate = birthLike.getDate();
    if(birthDate){
      birthYear = birthDate.getYear();
    }
  }
  if(deathLike){
    let deathDate = deathLike.getYear();
    if(deathDate){
      deathYear = deathDate.getYear();
    }
  }
  if(birthYear && deathYear){
    return `${birthYear} - ${deathYear}`;
  } else if(birthYear){
    return `born ${birthYear}`;
  } else if(deathYear){
    return `died ${deathYear}`;
  }
};

/**
 * Get the year of a date, if possible.
 * 
 * @return {String} year
 */
GedcomX.Date.prototype.getYear = function(){
  if(this.normalized){
    let matches = this.normalized.match(/\+(\d{4})/);
    if(matches){
      return matches[1];
    }
  }
  if(this.original){
    let matches = this.original.match(/\b\d{4}\b/);
    if(matches){
      return matches[0]
    }
  }
  return '';
};