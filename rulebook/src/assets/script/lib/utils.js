import skills from '_skills';

export function parseRequirements(requirements, curr) {
  let nestedRequirements = [],
      requirementLevel,
      skill;

  requirements.push(curr);

  if(
    typeof curr === "string" 
    && curr.includes("*")
  ) {
    requirementLevel = curr[1] - 1;

    for(requirementLevel; requirementLevel > 0; requirementLevel--) {
      requirements.push(`*${requirementLevel}`)
    }
  }
  else if(typeof curr === "string") {
    skill = skills.skills.find(skill => skill.id === curr);
    
    try {
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);
    }
    catch(e) {
      console.warn(`No skill with id ${curr} has been found.`);
    }
    
    requirements = requirements.concat(nestedRequirements);
  }
  else if( Array.isArray(curr) ) {
    curr.forEach((option) => {
      skill = skills.skills.find(skill => skill.id === option);
      
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);

      curr = curr.concat(nestedRequirements);
    });
  }
  
  return requirements;
} 

export const groupedSkills = skills.skills
  .reduce((arr, skill) => {
    if( !skill.requirements.some( _ => _.includes("talent-") ) )
      arr.push(skill);
    
    return arr;
  }, [])
  .reduce((arr, skill) => {
    let requirementsLevel = skill.requirements
      .reduce(parseRequirements, []).length,
        group = arr[requirementsLevel] || [];
    
    group.push(skill);
    arr[requirementsLevel] = group;
    
    return arr;
  }, []);