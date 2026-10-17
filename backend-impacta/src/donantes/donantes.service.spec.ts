import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Donante, TipoDonante } from './entities/donante.entity';
import { DonantesService } from './donantes.service';

describe('DonantesService', () => {
  let service: DonantesService;
  let module: TestingModule | undefined;
  let repository: {
    create: jest.Mock<(dto: CreateDonanteDto) => Donante>;
    save: jest.Mock<(donor: Donante) => Promise<Donante>>;
    find: jest.Mock<
      (options: { where: { estado: boolean } }) => Promise<Donante[]>
    >;
    findOne: jest.Mock<
      (options: {
        where: { id: string; estado: boolean };
      }) => Promise<Donante | null>
    >;
    update: jest.Mock<
      (id: string, partial: Partial<Donante>) => Promise<{ affected: number }>
    >;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn<(dto: CreateDonanteDto) => Donante>(),
      save: jest.fn<(donor: Donante) => Promise<Donante>>(),
      find: jest.fn<
        (options: { where: { estado: boolean } }) => Promise<Donante[]>
      >(),
      findOne:
        jest.fn<
          (options: {
            where: { id: string; estado: boolean };
          }) => Promise<Donante | null>
        >(),
      update:
        jest.fn<
          (
            id: string,
            partial: Partial<Donante>,
          ) => Promise<{ affected: number }>
        >(),
    };

    const testingModule = await Test.createTestingModule({
      providers: [
        DonantesService,
        {
          provide: getRepositoryToken(Donante),
          useValue: repository,
        },
      ],
    }).compile();

    module = testingModule;
    service = testingModule.get<DonantesService>(DonantesService);
  });

  afterEach(async () => {
    await module?.close();
  });

  it('creates a donor and persists the repository entity', async () => {
    const dto: CreateDonanteDto = {
      nombre: 'Fundación Esperanza',
      tipo: TipoDonante.FUNDACION,
      email: 'contacto@esperanza.test',
      telefono: '55512345',
    };
    const donor = { id: 'donor-id', ...dto, estado: true } as Donante;
    repository.create.mockReturnValue(donor);
    repository.save.mockResolvedValue(donor);

    await expect(service.create(dto)).resolves.toEqual(donor);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(donor);
  });

  it('returns only active donors in the catalog', async () => {
    const donors = [
      {
        id: 'donor-id',
        nombre: 'Fundación Esperanza',
        tipo: TipoDonante.FUNDACION,
        email: 'contacto@esperanza.test',
        telefono: '55512345',
        estado: true,
      },
    ];
    repository.find.mockResolvedValue(donors);

    await expect(service.findAll()).resolves.toEqual(donors);
    expect(repository.find).toHaveBeenCalledWith({
      where: { estado: true },
    });
  });

  it('throws NotFoundException when an active donor does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'missing-id', estado: true },
    });
  });

  it('updates an active donor and returns the persisted data', async () => {
    const donor = {
      id: 'donor-id',
      nombre: 'Nombre anterior',
      tipo: TipoDonante.INDIVIDUAL,
      estado: true,
    } as Donante;
    const updatedDonor = { ...donor, nombre: 'Nombre actualizado' };
    const dto: UpdateDonanteDto = { nombre: 'Nombre actualizado' };
    repository.findOne
      .mockResolvedValueOnce(donor)
      .mockResolvedValueOnce(updatedDonor);
    repository.update.mockResolvedValue({ affected: 1 });

    await expect(service.update(donor.id, dto)).resolves.toEqual(updatedDonor);
    expect(repository.update).toHaveBeenCalledWith(donor.id, dto);
  });

  it('deactivates an active donor instead of deleting it', async () => {
    const donor = {
      id: 'donor-id',
      nombre: 'Fundación Esperanza',
      tipo: TipoDonante.FUNDACION,
      estado: true,
    } as Donante;
    repository.findOne.mockResolvedValue(donor);
    repository.update.mockResolvedValue({ affected: 1 });

    await expect(service.remove(donor.id)).resolves.toEqual({
      message: 'Donante desactivado correctamente',
    });
    expect(repository.update).toHaveBeenCalledWith(donor.id, {
      estado: false,
    });
  });
});
