/* import { computed, DestroyRef, inject, Injectable, LOCALE_ID, signal } from "@angular/core";
import { StudentModel } from "./student.model";
import { HttpErrorResponse } from "@angular/common/http";
import { StudentServiceTs } from "./student.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";


export interface studentStore {
    student: readonly StudentModel[];
    loading: boolean;
    error: HttpErrorResponse | null
}

const _initialState: studentStore = {
    student: [],
    loading: false,
    error: null
}
@Injectable()
export class StudentStore {
    private readonly studentService = inject(StudentServiceTs);
    private state = signal(_initialState);
    private readonly destroyRef = inject(DestroyRef);

    student = computed(() => this.state().student);
    loading = computed(() => this.state().loading);
    error = computed(()=> this.state().error);

    addStudent(student: StudentModel) {
        this.setLoading();
        this.studentService.addStudent(student).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (student: StudentModel) => {
                this.state.update(state => ({...state, student: [...state.student, student], loading: false}));
            },
            error: (error) => {
                console.log(error);
                this.setError(error);
            }
        });
    }

    updateStudent(student: StudentModel) {
        this.studentService.updateStudent(student).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.state.update(state => {
                    const studentIndex = state.student.findIndex(s => s.studentId === student.studentId);
                    if (studentIndex !== -1) {
                        const updatedStudents = [...state.student];
                        updatedStudents[studentIndex] = { ...state.student[studentIndex], ...student };
                        return { ...state, student: updatedStudents, loading: false };
                    }
                    return state;
                });
            },
            error: (error) => {
                console.log(error);
                this.setError(error);
            }
        });
    }

    deleteStudent(id: number) {
        this.studentService.deleteStudent(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.state.update(state => ({ ...state, student: state.student.filter(s => s.studentId !== id), loading: false }));
            },
            error: (error) => {
                console.log(error);
                this.setError(error);
            }
        });
    }

    private loadStudents() {
        this.setLoading();
        this.studentService.getStudents().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            // Esse student é o retorno da API, diretamente do backend, e não o student do state.
            next:(student)=>this.state.update(state=> ({
                ...state, student, loading: false})),
            error:(error)=>{
                console.log(error);
                this.setError(error);
            }
        });
    }
    private setLoading() {

        this.state.update(state=> ({...state, loading: true}));
    }

    private setError(error: HttpErrorResponse) {
        this.state.update(state=> ({...state, loading: false, error}));
    }

    constructor() {
        this.loadStudents();
    }

}
 */