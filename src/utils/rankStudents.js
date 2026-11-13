export function rankStudents(students) {
  const sortedStudents = [...students]
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  let rank = 0
  return sortedStudents.map((student, index, sorted) => {
    if (index === 0 || student.points !== sorted[index - 1].points) rank += 1
    return { student, rank }
  })
}
