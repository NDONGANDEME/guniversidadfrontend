export class u_carrera
{
    static manejoTabla(){
        $(document).ready( () => {
            $('#tablaCarreras').DataTable({
                language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.modal({
                            header: function(row) {
                                var data = row.data();
                                return 'Detalles de: ' + data[0];
                            }
                        }),
                        renderer: $.fn.dataTable.Responsive.renderer.tableAll()
                    }
                },
                columnDefs: [
                    { responsivePriority: 1, targets: 0 },  // prioridad alta
                    { responsivePriority: 2, targets: 2 },
                    { responsivePriority: 3, targets: [0,1] }
                ]
            });
        });
    }
}